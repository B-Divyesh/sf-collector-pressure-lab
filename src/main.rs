use clap::{Args, Parser, Subcommand};
use collector_pressure_lab::{
    Classification, Experiment, MAX_REQUESTS_PER_STEP, Report, inspect_config, load_sample,
    parse_duration,
};
use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Parser)]
#[command(name = "cplab", version, about = "Find where a local OpenTelemetry Collector queues, slows, or drops", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Run a safe sample against a temporary loopback receiver
    Demo,
    /// Replay a bounded sample through a local Collector
    Run(RunArgs),
    /// Show pressure-relevant settings without sending traffic
    Inspect(InspectArgs),
}

#[derive(Args)]
struct InspectArgs {
    /// OpenTelemetry Collector YAML configuration
    #[arg(short, long)]
    config: PathBuf,
    /// Emit stable machine-readable JSON
    #[arg(long)]
    json: bool,
}

#[derive(Args)]
struct RunArgs {
    /// OpenTelemetry Collector YAML configuration
    #[arg(short, long)]
    config: PathBuf,
    /// JSON payload or NDJSON request bodies (max 8 MiB / 10,000 lines)
    #[arg(short, long)]
    sample: PathBuf,
    /// OTLP/HTTP test endpoint; loopback only unless explicitly overridden
    #[arg(long, default_value = "http://127.0.0.1:4318/v1/traces")]
    endpoint: String,
    /// Collector Prometheus self-metrics URL, or "off"
    #[arg(long, default_value = "http://127.0.0.1:8888/metrics")]
    metrics_endpoint: String,
    /// Comma-separated request rates in requests/second
    #[arg(long, value_delimiter = ',', default_value = "25,50,100,200")]
    rates: Vec<u32>,
    /// Time per rate step, from 250ms to 30s
    #[arg(long, default_value = "2s")]
    duration: String,
    /// Per-request timeout, from 50ms to 30s
    #[arg(long, default_value = "2s")]
    timeout: String,
    /// Maximum concurrent requests
    #[arg(long, default_value_t = 32)]
    concurrency: usize,
    /// Hard request cap for each step
    #[arg(long, default_value_t = MAX_REQUESTS_PER_STEP)]
    max_requests: usize,
    /// Extra HTTP header as name:value; may be repeated
    #[arg(long, value_parser = parse_header)]
    header: Vec<(String, String)>,
    /// Permit a non-loopback HTTP endpoint in a controlled lab
    #[arg(long)]
    allow_remote: bool,
    /// Emit stable machine-readable JSON
    #[arg(long)]
    json: bool,
    /// Disable human status messages for CI logs
    #[arg(long)]
    ci: bool,
}

fn parse_header(value: &str) -> Result<(String, String), String> {
    let (name, value) = value.split_once(':').ok_or("header must use name:value")?;
    Ok((name.trim().to_string(), value.trim().to_string()))
}

fn main() -> ExitCode {
    match execute(Cli::parse()) {
        Ok(()) => ExitCode::SUCCESS,
        Err((code, message)) => {
            eprintln!("cplab: {message}");
            ExitCode::from(code)
        }
    }
}

fn execute(cli: Cli) -> Result<(), (u8, String)> {
    match cli.command {
        Command::Demo => run_demo(),
        Command::Inspect(args) => {
            let config = inspect_config(&args.config).map_err(|e| (2, e))?;
            if args.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&config).map_err(|e| (2, e.to_string()))?
                );
            } else {
                println!("COLLECTOR PRESSURE SETTINGS");
                println!(
                    "  sending queue  {}",
                    option_bool(config.sending_queue_enabled)
                );
                println!("  queue size     {}", option_number(config.queue_size));
                println!("  consumers      {}", option_number(config.num_consumers));
                println!(
                    "  batch timeout  {}",
                    config.batch_timeout.as_deref().unwrap_or("not explicit")
                );
                println!("  batch size     {}", option_number(config.send_batch_size));
                println!(
                    "  batch maximum  {}",
                    option_number(config.send_batch_max_size)
                );
                for warning in config.warnings {
                    println!("  note: {warning}");
                }
            }
            Ok(())
        }
        Command::Run(args) => {
            let config = inspect_config(&args.config).map_err(|e| (2, e))?;
            let sample = load_sample(&args.sample).map_err(|e| (2, e))?;
            let duration = parse_duration(&args.duration).map_err(|e| (2, e))?;
            let timeout = parse_duration(&args.timeout).map_err(|e| (2, e))?;
            let experiment = Experiment {
                endpoint: args.endpoint,
                metrics_endpoint: (args.metrics_endpoint != "off").then_some(args.metrics_endpoint),
                rates: args.rates,
                duration,
                timeout,
                concurrency: args.concurrency,
                max_requests: args.max_requests,
                headers: args.header,
                allow_remote: args.allow_remote,
            };
            experiment.validate().map_err(|e| (2, e))?;
            if experiment.allow_remote {
                eprintln!("WARNING: remote endpoint override enabled; samples will be sent to the chosen endpoint.");
            }
            if !args.ci && !args.json {
                eprintln!(
                    "Loaded {} local request body/bodies ({} bytes). Running {} bounded step(s)…",
                    sample.bodies.len(),
                    sample.source_bytes,
                    experiment.rates.len()
                );
            }
            let report = experiment.run(&sample, config).map_err(|e| (3, e))?;
            if args.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&report).map_err(|e| (2, e.to_string()))?
                );
            } else {
                print_report(&report);
            }
            Ok(())
        }
    }
}

struct DemoReceiver {
    endpoint: String,
    stop: Arc<AtomicBool>,
    handle: Option<thread::JoinHandle<()>>,
}

impl DemoReceiver {
    fn start() -> Result<Self, (u8, String)> {
        let listener = TcpListener::bind("127.0.0.1:0").map_err(|error| (3, error.to_string()))?;
        listener
            .set_nonblocking(true)
            .map_err(|error| (3, error.to_string()))?;
        let address = listener
            .local_addr()
            .map_err(|error| (3, error.to_string()))?;
        let stop = Arc::new(AtomicBool::new(false));
        let child_stop = Arc::clone(&stop);
        let handle = thread::spawn(move || {
            while !child_stop.load(Ordering::Relaxed) {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        let mut request = [0_u8; 8192];
                        let _ = stream.read(&mut request);
                        thread::sleep(Duration::from_millis(20));
                        let _ = stream.write_all(
                            b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{}",
                        );
                    }
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(1));
                    }
                    Err(_) => break,
                }
            }
        });
        Ok(Self {
            endpoint: format!("http://{address}/v1/traces"),
            stop,
            handle: Some(handle),
        })
    }
}

impl Drop for DemoReceiver {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

fn run_demo() -> Result<(), (u8, String)> {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| (3, error.to_string()))?
        .as_millis();
    let directory =
        std::env::temp_dir().join(format!("cplab-demo-{}-{unique}", std::process::id()));
    std::fs::create_dir(&directory).map_err(|error| (3, error.to_string()))?;
    let config_path = directory.join("collector.yaml");
    let sample_path = directory.join("traces.ndjson");
    std::fs::write(&config_path, include_str!("../examples/collector.yaml"))
        .map_err(|error| (3, error.to_string()))?;
    std::fs::write(&sample_path, include_str!("../examples/traces.ndjson"))
        .map_err(|error| (3, error.to_string()))?;

    let receiver = DemoReceiver::start()?;
    let config = inspect_config(&config_path).map_err(|error| (2, error))?;
    let sample = load_sample(&sample_path).map_err(|error| (2, error))?;
    let report = Experiment {
        endpoint: receiver.endpoint.clone(),
        metrics_endpoint: None,
        rates: vec![20, 100],
        duration: Duration::from_millis(500),
        timeout: Duration::from_secs(3),
        concurrency: 24,
        max_requests: 500,
        headers: vec![],
        allow_remote: false,
    }
    .run(&sample, config)
    .map_err(|error| (3, error))?;
    let report_path = directory.join("report.json");
    let report_json =
        serde_json::to_string_pretty(&report).map_err(|error| (2, error.to_string()))?;
    std::fs::write(&report_path, report_json).map_err(|error| (3, error.to_string()))?;

    println!("DEMO — bundled sample, temporary loopback receiver\n");
    print_report(&report);
    println!("\nDemo files: {}", directory.display());
    println!("Nothing was written to the current directory.");
    Ok(())
}

fn option_bool(value: Option<bool>) -> &'static str {
    match value {
        Some(true) => "enabled",
        Some(false) => "disabled",
        None => "not explicit",
    }
}

fn option_number(value: Option<u64>) -> String {
    value
        .map(|v| v.to_string())
        .unwrap_or_else(|| "not explicit".into())
}

fn print_report(report: &Report) {
    println!(
        "\nCOLLECTOR RESULT  {}",
        report.classification.to_string().to_uppercase()
    );
    println!("Synthetic test result — not a production capacity guarantee.\n");
    println!("offered   ok/drop   achieved   p50 / p95        state");
    for step in &report.steps {
        println!(
            "{:>5}/s   {:>4}/{:<4} {:>7.1}/s   {:>5.1}/{:<6.1}ms  {}",
            step.offered_rps,
            step.succeeded,
            step.dropped,
            step.achieved_rps,
            step.p50_ms,
            step.p95_ms,
            step.classification
        );
    }
    match report.threshold_rps {
        Some(value) => {
            println!("\nFirst pressure threshold: ~{value:.1} measured successful requests/s")
        }
        None => println!("\nNo pressure threshold found inside the tested envelope."),
    }
    println!("\nNEXT SETTINGS TO TEST");
    for hypothesis in &report.hypotheses {
        println!("  - {hypothesis}");
    }
    if !report.warnings.is_empty() {
        println!("\nNOTES");
        for warning in &report.warnings {
            println!("  - {warning}");
        }
    }
    if report.classification == Classification::Drops {
        println!("\nDrops are evidence to investigate, not a recommendation to raise limits.");
    }
}
