//! Core experiment engine for Collector Pressure Lab.
//!
//! The public API is deliberately small: inspect a Collector config, load a
//! bounded local sample, then run an [`Experiment`] against an HTTP endpoint.
//!
//! ```
//! use collector_pressure_lab::parse_config;
//!
//! let summary = parse_config("exporters:\n  otlp:\n    sending_queue:\n      enabled: true\n      queue_size: 2048\n");
//! assert_eq!(summary.sending_queue_enabled, Some(true));
//! assert_eq!(summary.queue_size, Some(2048));
//! ```

use serde::Serialize;
use std::collections::BTreeMap;
use std::fs;
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::Path;
use std::sync::{Arc, Mutex, mpsc};
use std::thread;
use std::time::{Duration, Instant};

pub const MAX_SAMPLE_BYTES: u64 = 8 * 1024 * 1024;
pub const MAX_SAMPLE_RECORDS: usize = 10_000;
pub const MAX_REQUESTS_PER_STEP: usize = 5_000;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct ConfigSummary {
    pub sending_queue_enabled: Option<bool>,
    pub queue_size: Option<u64>,
    pub num_consumers: Option<u64>,
    pub batch_timeout: Option<String>,
    pub send_batch_size: Option<u64>,
    pub send_batch_max_size: Option<u64>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct Sample {
    pub bodies: Vec<Vec<u8>>,
    pub source_bytes: u64,
}

#[derive(Debug, Clone)]
pub struct Experiment {
    pub endpoint: String,
    pub metrics_endpoint: Option<String>,
    pub rates: Vec<u32>,
    pub duration: Duration,
    pub timeout: Duration,
    pub concurrency: usize,
    pub max_requests: usize,
    pub headers: Vec<(String, String)>,
    pub allow_remote: bool,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Classification {
    Stable,
    Backpressure,
    Drops,
}

impl std::fmt::Display for Classification {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Stable => write!(f, "stable"),
            Self::Backpressure => write!(f, "backpressure"),
            Self::Drops => write!(f, "drops"),
        }
    }
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct MetricsDelta {
    pub queue_size: Option<f64>,
    pub queue_capacity: Option<f64>,
    pub failed_or_refused: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct StepResult {
    pub offered_rps: u32,
    pub attempted: usize,
    pub succeeded: usize,
    pub dropped: usize,
    pub achieved_rps: f64,
    pub p50_ms: f64,
    pub p95_ms: f64,
    pub classification: Classification,
    pub metrics: MetricsDelta,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub version: &'static str,
    pub classification: Classification,
    pub threshold_rps: Option<f64>,
    pub steps: Vec<StepResult>,
    pub config: ConfigSummary,
    pub hypotheses: Vec<String>,
    pub warnings: Vec<String>,
}

/// Inspect only the pressure-relevant subset of a Collector YAML file.
pub fn inspect_config(path: impl AsRef<Path>) -> Result<ConfigSummary, String> {
    let text = fs::read_to_string(path.as_ref())
        .map_err(|e| format!("could not read config {}: {e}", path.as_ref().display()))?;
    Ok(parse_config(&text))
}

pub fn parse_config(text: &str) -> ConfigSummary {
    let mut result = ConfigSummary::default();
    let mut stack: Vec<(usize, String)> = Vec::new();

    for raw in text.lines() {
        let line = raw.split('#').next().unwrap_or("").trim_end();
        if line.trim().is_empty() || line.trim_start().starts_with('-') {
            continue;
        }
        let indent = line.len() - line.trim_start().len();
        let Some((key, value)) = line.trim().split_once(':') else {
            continue;
        };
        while stack.last().is_some_and(|(level, _)| *level >= indent) {
            stack.pop();
        }
        let key = key.trim().to_string();
        let value = value.trim().trim_matches(['\'', '"']);
        let parent = stack.last().map(|(_, name)| name.as_str());

        match (parent, key.as_str()) {
            (Some("sending_queue"), "enabled") => {
                result.sending_queue_enabled =
                    parse_bool(value, &mut result.warnings, "sending_queue.enabled");
            }
            (Some("sending_queue"), "queue_size") => {
                result.queue_size =
                    parse_u64(value, &mut result.warnings, "sending_queue.queue_size");
            }
            (Some("sending_queue"), "num_consumers") => {
                result.num_consumers =
                    parse_u64(value, &mut result.warnings, "sending_queue.num_consumers");
            }
            (Some(parent), "timeout") if parent == "batch" || parent.starts_with("batch/") => {
                if !value.is_empty() {
                    result.batch_timeout = Some(value.to_string());
                }
            }
            (Some(parent), "send_batch_size")
                if parent == "batch" || parent.starts_with("batch/") =>
            {
                result.send_batch_size =
                    parse_u64(value, &mut result.warnings, "batch.send_batch_size");
            }
            (Some(parent), "send_batch_max_size")
                if parent == "batch" || parent.starts_with("batch/") =>
            {
                result.send_batch_max_size =
                    parse_u64(value, &mut result.warnings, "batch.send_batch_max_size");
            }
            _ => {}
        }
        if value.is_empty() {
            stack.push((indent, key));
        }
    }

    if result.sending_queue_enabled.is_none() && result.queue_size.is_none() {
        result
            .warnings
            .push("no explicit exporter sending_queue settings found".into());
    }
    if result.batch_timeout.is_none() && result.send_batch_size.is_none() {
        result
            .warnings
            .push("no explicit batch processor settings found".into());
    }
    result
}

fn parse_u64(value: &str, warnings: &mut Vec<String>, name: &str) -> Option<u64> {
    match value.parse() {
        Ok(v) => Some(v),
        Err(_) => {
            warnings.push(format!("{name} is templated or invalid; left unknown"));
            None
        }
    }
}

fn parse_bool(value: &str, warnings: &mut Vec<String>, name: &str) -> Option<bool> {
    match value {
        "true" => Some(true),
        "false" => Some(false),
        _ => {
            warnings.push(format!("{name} is templated or invalid; left unknown"));
            None
        }
    }
}

/// Load one JSON body, or one body per non-empty NDJSON line.
pub fn load_sample(path: impl AsRef<Path>) -> Result<Sample, String> {
    let meta = fs::metadata(path.as_ref())
        .map_err(|e| format!("could not read sample {}: {e}", path.as_ref().display()))?;
    if meta.len() == 0 {
        return Err("sample is empty; provide JSON or NDJSON request bodies".into());
    }
    if meta.len() > MAX_SAMPLE_BYTES {
        return Err(format!(
            "sample is {} bytes; limit is {} bytes",
            meta.len(),
            MAX_SAMPLE_BYTES
        ));
    }
    let bytes = fs::read(path.as_ref()).map_err(|e| format!("could not read sample: {e}"))?;
    if serde_json::from_slice::<serde_json::Value>(&bytes).is_ok() {
        return Ok(Sample {
            bodies: vec![bytes],
            source_bytes: meta.len(),
        });
    }

    let text = std::str::from_utf8(&bytes).map_err(|_| "sample must be UTF-8 JSON or NDJSON")?;
    let mut bodies = Vec::new();
    for (index, line) in text
        .lines()
        .filter(|line| !line.trim().is_empty())
        .enumerate()
    {
        if index >= MAX_SAMPLE_RECORDS {
            return Err(format!(
                "sample exceeds {MAX_SAMPLE_RECORDS} NDJSON records"
            ));
        }
        serde_json::from_str::<serde_json::Value>(line)
            .map_err(|e| format!("invalid JSON on non-empty sample line {}: {e}", index + 1))?;
        bodies.push(line.as_bytes().to_vec());
    }
    if bodies.is_empty() {
        return Err("sample contains no JSON request bodies".into());
    }
    Ok(Sample {
        bodies,
        source_bytes: meta.len(),
    })
}

impl Experiment {
    pub fn validate(&self) -> Result<(), String> {
        let endpoint = HttpUrl::parse(&self.endpoint)?;
        if !self.allow_remote && !endpoint.is_loopback() {
            return Err(format!(
                "endpoint host '{}' is not loopback; use --allow-remote only in a controlled lab",
                endpoint.host
            ));
        }
        if let Some(metrics) = &self.metrics_endpoint {
            let parsed = HttpUrl::parse(metrics)?;
            if !self.allow_remote && !parsed.is_loopback() {
                return Err("metrics endpoint must also be loopback".into());
            }
        }
        if self.rates.is_empty()
            || self.rates.len() > 12
            || self.rates.iter().any(|r| *r == 0 || *r > 10_000)
        {
            return Err("rates must contain 1–12 values between 1 and 10,000 rps".into());
        }
        if self.duration < Duration::from_millis(250) || self.duration > Duration::from_secs(30) {
            return Err("duration must be between 250ms and 30s".into());
        }
        if self.timeout < Duration::from_millis(50) || self.timeout > Duration::from_secs(30) {
            return Err("timeout must be between 50ms and 30s".into());
        }
        if self.concurrency == 0 || self.concurrency > 256 {
            return Err("concurrency must be between 1 and 256".into());
        }
        if self.max_requests == 0 || self.max_requests > MAX_REQUESTS_PER_STEP {
            return Err(format!(
                "max requests must be between 1 and {MAX_REQUESTS_PER_STEP}"
            ));
        }
        for (name, value) in &self.headers {
            if name.is_empty() || name.contains(['\r', '\n', ':']) || value.contains(['\r', '\n']) {
                return Err("header names/values may not contain colons or line breaks".into());
            }
        }
        Ok(())
    }

    pub fn run(&self, sample: &Sample, config: ConfigSummary) -> Result<Report, String> {
        self.validate()?;
        if sample.bodies.is_empty() {
            return Err("sample has no request bodies".into());
        }
        let endpoint = HttpUrl::parse(&self.endpoint)?;
        let metrics_url = self
            .metrics_endpoint
            .as_ref()
            .and_then(|url| HttpUrl::parse(url).ok());
        let mut steps = Vec::new();
        let mut warnings = config.warnings.clone();
        if self.allow_remote {
            warnings.push(
                "remote endpoint override enabled; this is no longer a loopback-only experiment"
                    .into(),
            );
        }
        let mut previous_p95: Option<f64> = None;

        for rate in &self.rates {
            let metrics_before = metrics_url
                .as_ref()
                .and_then(|url| scrape_metrics(url, self.timeout).ok());
            let mut step = run_step(self, &endpoint, sample, *rate)?;
            let metrics_after = metrics_url
                .as_ref()
                .and_then(|url| scrape_metrics(url, self.timeout).ok());
            step.metrics = metric_delta(metrics_before.as_ref(), metrics_after.as_ref());
            step.classification = classify_step(&step, previous_p95);
            if step.succeeded > 0 {
                previous_p95 = Some(step.p95_ms);
            }
            steps.push(step);
        }
        if metrics_url.is_some()
            && steps.iter().all(|step| {
                step.metrics.queue_size.is_none() && step.metrics.failed_or_refused == 0.0
            })
        {
            warnings.push("Collector self-metrics were unavailable or contained no recognized pressure metrics; response evidence was used".into());
        }
        if steps.iter().all(|step| step.succeeded == 0) {
            return Err("every request failed; check that the local Collector endpoint and signal path are running".into());
        }
        let classification = if steps
            .iter()
            .any(|s| s.classification == Classification::Drops)
        {
            Classification::Drops
        } else if steps
            .iter()
            .any(|s| s.classification == Classification::Backpressure)
        {
            Classification::Backpressure
        } else {
            Classification::Stable
        };
        let threshold_rps = steps
            .iter()
            .find(|s| s.classification != Classification::Stable)
            .map(|s| s.achieved_rps);
        let hypotheses = hypotheses(classification, &config, &steps);
        Ok(Report {
            version: env!("CARGO_PKG_VERSION"),
            classification,
            threshold_rps,
            steps,
            config,
            hypotheses,
            warnings,
        })
    }
}

#[derive(Debug, Clone)]
struct HttpUrl {
    host: String,
    port: u16,
    path: String,
}

impl HttpUrl {
    fn parse(input: &str) -> Result<Self, String> {
        let rest = input
            .strip_prefix("http://")
            .ok_or("only http:// endpoints are supported; use an isolated local Collector")?;
        let (authority, path) = rest
            .split_once('/')
            .map_or((rest, "/"), |(a, _)| (a, &rest[a.len()..]));
        if authority.is_empty() {
            return Err("endpoint URL has no host".into());
        }
        let (host, port) = if authority.starts_with('[') {
            let close = authority.find(']').ok_or("invalid bracketed IPv6 host")?;
            let host = &authority[1..close];
            let port = authority
                .get(close + 1..)
                .and_then(|s| s.strip_prefix(':'))
                .map(|s| s.parse())
                .transpose()
                .map_err(|_| "invalid endpoint port")?
                .unwrap_or(80);
            (host.to_string(), port)
        } else if let Some((host, port)) = authority.rsplit_once(':') {
            (
                host.to_string(),
                port.parse().map_err(|_| "invalid endpoint port")?,
            )
        } else {
            (authority.to_string(), 80)
        };
        Ok(Self {
            host,
            port,
            path: path.to_string(),
        })
    }

    fn is_loopback(&self) -> bool {
        self.host.eq_ignore_ascii_case("localhost")
            || self.host == "127.0.0.1"
            || self.host == "::1"
    }
}

#[derive(Debug)]
struct RequestResult {
    success: bool,
    latency_ms: f64,
}

fn run_step(
    exp: &Experiment,
    endpoint: &HttpUrl,
    sample: &Sample,
    rate: u32,
) -> Result<StepResult, String> {
    let wanted = ((rate as f64 * exp.duration.as_secs_f64()).ceil() as usize).min(exp.max_requests);
    let worker_count = exp.concurrency.min(wanted.max(1));
    let (work_tx, work_rx) = mpsc::sync_channel::<Vec<u8>>(worker_count * 2);
    let work_rx = Arc::new(Mutex::new(work_rx));
    let (result_tx, result_rx) = mpsc::channel();
    let mut workers = Vec::with_capacity(worker_count);
    for _ in 0..worker_count {
        let receiver = Arc::clone(&work_rx);
        let sender = result_tx.clone();
        let url = endpoint.clone();
        let headers = exp.headers.clone();
        let timeout = exp.timeout;
        workers.push(thread::spawn(move || {
            loop {
                let body = match receiver.lock().expect("worker receiver poisoned").recv() {
                    Ok(body) => body,
                    Err(_) => break,
                };
                let started = Instant::now();
                let success = send_http(&url, "POST", Some(&body), &headers, timeout)
                    .is_ok_and(|status| (200..300).contains(&status));
                let _ = sender.send(RequestResult {
                    success,
                    latency_ms: started.elapsed().as_secs_f64() * 1000.0,
                });
            }
        }));
    }
    drop(result_tx);

    let started = Instant::now();
    let interval = Duration::from_secs_f64(1.0 / rate as f64);
    let mut attempted = 0;
    for index in 0..wanted {
        let target = started + interval.mul_f64(index as f64);
        if let Some(wait) = target.checked_duration_since(Instant::now()) {
            thread::sleep(wait);
        }
        if started.elapsed() > exp.duration + interval {
            break;
        }
        if work_tx
            .send(sample.bodies[index % sample.bodies.len()].clone())
            .is_err()
        {
            break;
        }
        attempted += 1;
    }
    drop(work_tx);
    let mut latencies = Vec::with_capacity(attempted);
    let mut succeeded = 0;
    for result in result_rx.iter().take(attempted) {
        if result.success {
            succeeded += 1;
        }
        latencies.push(result.latency_ms);
    }
    for worker in workers {
        let _ = worker.join();
    }
    let elapsed = started.elapsed().as_secs_f64().max(0.001);
    latencies.sort_by(f64::total_cmp);
    let p50_ms = percentile(&latencies, 0.50);
    let p95_ms = percentile(&latencies, 0.95);
    Ok(StepResult {
        offered_rps: rate,
        attempted,
        succeeded,
        dropped: attempted.saturating_sub(succeeded),
        achieved_rps: succeeded as f64 / elapsed,
        p50_ms,
        p95_ms,
        classification: Classification::Stable,
        metrics: MetricsDelta::default(),
    })
}

fn percentile(values: &[f64], quantile: f64) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let index = ((values.len() - 1) as f64 * quantile).round() as usize;
    values[index]
}

fn classify_step(step: &StepResult, previous_p95: Option<f64>) -> Classification {
    if step.dropped > 0 || step.metrics.failed_or_refused > 0.0 {
        return Classification::Drops;
    }
    let queue_grew = step.metrics.queue_size.is_some_and(|growth| growth > 0.0);
    let throughput_limited =
        step.attempted >= 4 && step.achieved_rps < step.offered_rps as f64 * 0.80;
    let latency_rising = previous_p95.is_some_and(|base| step.p95_ms > 100.0_f64.max(base * 2.5));
    if queue_grew || throughput_limited || latency_rising {
        Classification::Backpressure
    } else {
        Classification::Stable
    }
}

fn send_http(
    url: &HttpUrl,
    method: &str,
    body: Option<&[u8]>,
    headers: &[(String, String)],
    timeout: Duration,
) -> Result<u16, String> {
    let address = socket_address(url);
    let socket = address
        .to_socket_addrs()
        .map_err(|e| format!("could not resolve {}: {e}", url.host))?
        .next()
        .ok_or("endpoint resolved to no address")?;
    let mut stream = TcpStream::connect_timeout(&socket, timeout)
        .map_err(|e| format!("connection failed: {e}"))?;
    stream
        .set_read_timeout(Some(timeout))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(timeout))
        .map_err(|e| e.to_string())?;
    let body = body.unwrap_or_default();
    let host = if url.host.contains(':') {
        format!("[{}]", url.host)
    } else {
        url.host.clone()
    };
    let mut request = format!(
        "{method} {} HTTP/1.1\r\nHost: {host}:{}\r\nConnection: close\r\nAccept: */*\r\n",
        url.path, url.port
    );
    if method == "POST" {
        request.push_str("Content-Type: application/json\r\n");
    }
    for (name, value) in headers {
        request.push_str(&format!("{name}: {value}\r\n"));
    }
    request.push_str(&format!("Content-Length: {}\r\n\r\n", body.len()));
    stream
        .write_all(request.as_bytes())
        .and_then(|_| stream.write_all(body))
        .map_err(|e| format!("request failed: {e}"))?;
    let mut response = [0_u8; 4096];
    let read = stream
        .read(&mut response)
        .map_err(|e| format!("response failed: {e}"))?;
    let head =
        std::str::from_utf8(&response[..read]).map_err(|_| "response header was not UTF-8")?;
    let status = head
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|s| s.parse().ok())
        .ok_or("invalid HTTP response")?;
    Ok(status)
}

#[derive(Debug, Default)]
struct MetricSnapshot {
    queue_size: Option<f64>,
    queue_capacity: Option<f64>,
    failed: f64,
}

fn scrape_metrics(url: &HttpUrl, timeout: Duration) -> Result<MetricSnapshot, String> {
    let address = socket_address(url);
    let socket = address
        .to_socket_addrs()
        .map_err(|e| e.to_string())?
        .next()
        .ok_or("no metrics address")?;
    let mut stream = TcpStream::connect_timeout(&socket, timeout).map_err(|e| e.to_string())?;
    stream
        .set_read_timeout(Some(timeout))
        .map_err(|e| e.to_string())?;
    let request = format!(
        "GET {} HTTP/1.1\r\nHost: {}:{}\r\nConnection: close\r\n\r\n",
        url.path, url.host, url.port
    );
    stream
        .write_all(request.as_bytes())
        .map_err(|e| e.to_string())?;
    let mut response = String::new();
    stream
        .take(2 * 1024 * 1024)
        .read_to_string(&mut response)
        .map_err(|e| e.to_string())?;
    let body = response
        .split_once("\r\n\r\n")
        .map(|(_, body)| body)
        .unwrap_or("");
    Ok(parse_metrics(body))
}

fn socket_address(url: &HttpUrl) -> String {
    if url.host.contains(':') {
        format!("[{}]:{}", url.host, url.port)
    } else {
        format!("{}:{}", url.host, url.port)
    }
}

fn parse_metrics(text: &str) -> MetricSnapshot {
    let mut sums: BTreeMap<&str, f64> = BTreeMap::new();
    for line in text.lines().filter(|line| !line.starts_with('#')) {
        let Some((name, value)) = line.rsplit_once(char::is_whitespace) else {
            continue;
        };
        let Ok(value) = value.trim().parse::<f64>() else {
            continue;
        };
        let key = if name.contains("exporter_queue_capacity")
            || name.contains("exporter_queue_size_capacity")
        {
            Some("capacity")
        } else if name.contains("exporter_queue_size") {
            Some("queue")
        } else if name.contains("send_failed")
            || name.contains("refused_")
            || name.contains("enqueue_failed")
        {
            Some("failed")
        } else {
            None
        };
        if let Some(key) = key {
            *sums.entry(key).or_default() += value;
        }
    }
    MetricSnapshot {
        queue_size: sums.get("queue").copied(),
        queue_capacity: sums.get("capacity").copied(),
        failed: sums.get("failed").copied().unwrap_or(0.0),
    }
}

fn metric_delta(before: Option<&MetricSnapshot>, after: Option<&MetricSnapshot>) -> MetricsDelta {
    let diff = |a: Option<f64>, b: Option<f64>| a.zip(b).map(|(a, b)| b - a);
    MetricsDelta {
        queue_size: before
            .zip(after)
            .and_then(|(a, b)| diff(a.queue_size, b.queue_size)),
        queue_capacity: after.and_then(|m| m.queue_capacity),
        failed_or_refused: before
            .zip(after)
            .map(|(a, b)| (b.failed - a.failed).max(0.0))
            .unwrap_or(0.0),
    }
}

fn hypotheses(
    classification: Classification,
    config: &ConfigSummary,
    steps: &[StepResult],
) -> Vec<String> {
    let mut result = Vec::new();
    match classification {
        Classification::Stable => result.push("No pressure appeared inside the tested envelope; add a higher bounded step or a more realistic slow-exporter fixture before increasing production limits.".into()),
        Classification::Backpressure => {
            result.push("Validate downstream exporter latency first; more queue capacity delays loss but does not create throughput.".into());
            if config.sending_queue_enabled != Some(true) {
                result.push("Test an exporter sending_queue in the isolated config so short bursts can drain after arrival pressure falls.".into());
            } else if let Some(size) = config.queue_size {
                result.push(format!("Queue size is {size}; compare it with the observed peak and the recovery time you can tolerate."));
            }
            if config.num_consumers.is_some_and(|n| n <= 1) {
                result.push("Test more queue consumers only if the downstream exporter safely accepts concurrent requests.".into());
            }
        }
        Classification::Drops => {
            result.push("Failures or refused telemetry appeared; fix downstream errors and memory limits before enlarging the queue.".into());
            result.push("Repeat around the first pressured step with finer rate increments to locate the safe operating margin.".into());
        }
    }
    if config
        .send_batch_max_size
        .is_some_and(|max| config.send_batch_size.is_some_and(|size| max < size))
    {
        result.push("send_batch_max_size is below send_batch_size; verify that this intentional cap is not forcing smaller exports.".into());
    }
    if steps.iter().any(|s| s.p95_ms > 500.0) {
        result.push("Response p95 exceeded 500 ms; inspect exporter timeouts and retry behavior during the same step.".into());
    }
    result
}

pub fn parse_duration(value: &str) -> Result<Duration, String> {
    let (number, multiplier) = if let Some(v) = value.strip_suffix("ms") {
        (v, 0.001)
    } else if let Some(v) = value.strip_suffix('s') {
        (v, 1.0)
    } else {
        return Err("duration must end in ms or s (for example 500ms or 2s)".into());
    };
    let amount: f64 = number
        .parse()
        .map_err(|_| "duration has an invalid number")?;
    if !amount.is_finite() || amount <= 0.0 {
        return Err("duration must be positive".into());
    }
    Ok(Duration::from_secs_f64(amount * multiplier))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_pressure_settings() {
        let config = parse_config(
            r#"
processors:
  batch:
    timeout: 2s
    send_batch_size: 512
exporters:
  otlp:
    sending_queue:
      enabled: true
      queue_size: 2048
      num_consumers: 4
"#,
        );
        assert_eq!(config.sending_queue_enabled, Some(true));
        assert_eq!(config.queue_size, Some(2048));
        assert_eq!(config.num_consumers, Some(4));
        assert_eq!(config.send_batch_size, Some(512));
        assert_eq!(config.batch_timeout.as_deref(), Some("2s"));
    }

    #[test]
    fn rejects_remote_by_default() {
        let exp = Experiment {
            endpoint: "http://example.com/x".into(),
            metrics_endpoint: None,
            rates: vec![1],
            duration: Duration::from_secs(1),
            timeout: Duration::from_secs(1),
            concurrency: 1,
            max_requests: 1,
            headers: vec![],
            allow_remote: false,
        };
        assert!(exp.validate().unwrap_err().contains("not loopback"));
    }

    #[test]
    fn parses_metrics_by_signal_sum() {
        let metrics = parse_metrics(
            "otelcol_exporter_queue_size{exporter=\"a\"} 4\notelcol_exporter_queue_size{exporter=\"b\"} 2\notelcol_exporter_send_failed_spans_total 3\n",
        );
        assert_eq!(metrics.queue_size, Some(6.0));
        assert_eq!(metrics.failed, 3.0);
    }

    #[test]
    fn parses_short_durations() {
        assert_eq!(parse_duration("250ms").unwrap(), Duration::from_millis(250));
        assert_eq!(parse_duration("2s").unwrap(), Duration::from_secs(2));
    }
}
