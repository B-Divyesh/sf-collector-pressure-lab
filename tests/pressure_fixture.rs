use collector_pressure_lab::{Classification, ConfigSummary, Experiment, Sample};
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::thread;
use std::time::Duration;

struct Fixture {
    endpoint: String,
    stop: Arc<AtomicBool>,
    handle: Option<thread::JoinHandle<()>>,
}

impl Fixture {
    fn start(delay: Duration, fail_every: Option<usize>) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        listener.set_nonblocking(true).unwrap();
        let address = listener.local_addr().unwrap();
        let stop = Arc::new(AtomicBool::new(false));
        let child_stop = Arc::clone(&stop);
        let count = Arc::new(AtomicUsize::new(0));
        let handle = thread::spawn(move || {
            while !child_stop.load(Ordering::Relaxed) {
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        let mut request = [0_u8; 2048];
                        let _ = stream.read(&mut request);
                        thread::sleep(delay);
                        let number = count.fetch_add(1, Ordering::Relaxed) + 1;
                        let failed = fail_every.is_some_and(|every| number.is_multiple_of(every));
                        let status = if failed { "503 Busy" } else { "200 OK" };
                        let response = format!(
                            "HTTP/1.1 {status}\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{{}}"
                        );
                        let _ = stream.write_all(response.as_bytes());
                    }
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(1));
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

impl Drop for Fixture {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
        if let Some(handle) = self.handle.take() {
            handle.join().unwrap();
        }
    }
}

fn experiment(endpoint: String, rates: Vec<u32>) -> Experiment {
    Experiment {
        endpoint,
        metrics_endpoint: None,
        rates,
        duration: Duration::from_millis(500),
        timeout: Duration::from_secs(3),
        concurrency: 24,
        max_requests: 500,
        headers: vec![],
        allow_remote: false,
    }
}

fn sample() -> Sample {
    Sample {
        bodies: vec![br#"{"resourceSpans":[]}"#.to_vec()],
        source_bytes: 20,
    }
}

#[test]
fn slow_exporter_is_backpressure_and_threshold_tracks_throughput() {
    let fixture = Fixture::start(Duration::from_millis(20), None);
    let report = experiment(fixture.endpoint.clone(), vec![20, 100])
        .run(&sample(), ConfigSummary::default())
        .unwrap();

    assert_eq!(report.steps[0].classification, Classification::Stable);
    assert_eq!(report.steps[1].classification, Classification::Backpressure);
    assert_eq!(report.classification, Classification::Backpressure);
    let threshold = report.threshold_rps.unwrap();
    assert!(
        (40.0..=60.0).contains(&threshold),
        "expected threshold within 20% of 50 rps, got {threshold}"
    );
}

#[test]
fn non_success_responses_are_drops() {
    let fixture = Fixture::start(Duration::from_millis(1), Some(3));
    let report = experiment(fixture.endpoint.clone(), vec![30])
        .run(&sample(), ConfigSummary::default())
        .unwrap();

    assert_eq!(report.classification, Classification::Drops);
    assert!(report.steps[0].dropped > 0);
}
