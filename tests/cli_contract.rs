use std::fs;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::process::Command;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use tempfile::tempdir;

struct StatusFixture {
    endpoint: String,
    stop: Arc<AtomicBool>,
    handle: Option<thread::JoinHandle<()>>,
}

impl StatusFixture {
    fn start(status: &str) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        listener.set_nonblocking(true).unwrap();
        let address = listener.local_addr().unwrap();
        let stop = Arc::new(AtomicBool::new(false));
        let child_stop = Arc::clone(&stop);
        let status = status.to_string();
        let handle = thread::spawn(move || {
            while !child_stop.load(Ordering::Relaxed) {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        let mut request = [0_u8; 2048];
                        let _ = stream.read(&mut request);
                        let response = format!(
                            "HTTP/1.1 {status}\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{{}}"
                        );
                        let _ = stream.write_all(response.as_bytes());
                    }
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(std::time::Duration::from_millis(1));
                    }
                    Err(_) => break,
                }
            }
        });
        Self {
            endpoint: format!("http://{address}/v1/traces"),
            stop,
            handle: Some(handle),
        }
    }
}

impl Drop for StatusFixture {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
        if let Some(handle) = self.handle.take() {
            handle.join().unwrap();
        }
    }
}

fn fixture_files() -> (tempfile::TempDir, std::path::PathBuf, std::path::PathBuf) {
    let directory = tempdir().unwrap();
    let config = directory.path().join("collector.yaml");
    let sample = directory.path().join("sample.json");
    fs::write(&config, "receivers: {}\n").unwrap();
    fs::write(&sample, r#"{"resourceSpans":[]}"#).unwrap();
    (directory, config, sample)
}

#[test]
fn documented_inspect_command_emits_json() {
    let directory = tempdir().unwrap();
    let config = directory.path().join("collector.yaml");
    fs::write(
        &config,
        "processors:\n  batch:\n    timeout: 1s\nexporters:\n  otlp:\n    sending_queue:\n      enabled: true\n      queue_size: 2000\n",
    )
    .unwrap();

    let output = Command::new(env!("CARGO_BIN_EXE_cplab"))
        .args(["inspect", "--config", config.to_str().unwrap(), "--json"])
        .output()
        .unwrap();
    assert!(output.status.success());
    let json: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(json["queue_size"], 2000);
}

#[test]
fn empty_sample_uses_documented_input_error_exit_code() {
    let directory = tempdir().unwrap();
    let config = directory.path().join("collector.yaml");
    let sample = directory.path().join("sample.json");
    fs::write(&config, "receivers: {}\n").unwrap();
    fs::write(&sample, "").unwrap();

    let status = Command::new(env!("CARGO_BIN_EXE_cplab"))
        .args([
            "run",
            "--config",
            config.to_str().unwrap(),
            "--sample",
            sample.to_str().unwrap(),
            "--ci",
        ])
        .status()
        .unwrap();
    assert_eq!(status.code(), Some(2));
}

#[test]
fn all_503_responses_exit_zero_with_a_complete_json_drop_report() {
    let fixture = StatusFixture::start("503 Busy");
    let (_directory, config, sample) = fixture_files();

    let output = Command::new(env!("CARGO_BIN_EXE_cplab"))
        .args([
            "run",
            "--config",
            config.to_str().unwrap(),
            "--sample",
            sample.to_str().unwrap(),
            "--endpoint",
            &fixture.endpoint,
            "--metrics-endpoint",
            "off",
            "--rates",
            "25",
            "--duration",
            "250ms",
            "--timeout",
            "1s",
            "--json",
            "--ci",
        ])
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let report: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(report["classification"], "drops");
    assert_eq!(report["steps"][0]["succeeded"], 0);
    assert!(report["steps"][0]["dropped"].as_u64().unwrap() > 0);
    assert_eq!(
        report["steps"][0]["responses"],
        report["steps"][0]["attempted"]
    );
    assert_eq!(report["steps"][0]["transport_errors"], 0);

    let human = Command::new(env!("CARGO_BIN_EXE_cplab"))
        .args([
            "run",
            "--config",
            config.to_str().unwrap(),
            "--sample",
            sample.to_str().unwrap(),
            "--endpoint",
            &fixture.endpoint,
            "--metrics-endpoint",
            "off",
            "--rates",
            "25",
            "--duration",
            "250ms",
            "--timeout",
            "1s",
            "--ci",
        ])
        .output()
        .unwrap();
    assert!(human.status.success());
    assert!(String::from_utf8_lossy(&human.stdout).contains("PRESSURE LINE  DROPS"));
}

#[test]
fn no_http_response_keeps_execution_error_exit_code() {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let endpoint = format!("http://{}/v1/traces", listener.local_addr().unwrap());
    drop(listener);
    let (_directory, config, sample) = fixture_files();

    let output = Command::new(env!("CARGO_BIN_EXE_cplab"))
        .args([
            "run",
            "--config",
            config.to_str().unwrap(),
            "--sample",
            sample.to_str().unwrap(),
            "--endpoint",
            &endpoint,
            "--metrics-endpoint",
            "off",
            "--rates",
            "25",
            "--duration",
            "250ms",
            "--timeout",
            "1s",
            "--ci",
        ])
        .output()
        .unwrap();

    assert_eq!(output.status.code(), Some(3));
    assert!(String::from_utf8_lossy(&output.stderr).contains("no HTTP responses were received"));
}
