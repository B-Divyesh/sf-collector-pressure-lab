use std::fs;
use std::process::Command;
use tempfile::tempdir;

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
