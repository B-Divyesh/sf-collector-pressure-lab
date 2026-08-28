# Demo sandbox

## Web demo

- URL: <https://collector-pressure-lab.sociobot.in/demo> or `/?demo=1`
- First action: **Try it with sample data** on the landing screen.
- Sample: 900 incoming items/s, 400 exported items/s, a 1,200-item queue, and a 10-second burst.
- Initial result: **Drops**, already populated when the route opens.
- Storage namespace: `demo:cplab:pressure-input` in localStorage. Ordinary mode never reads or writes this key.
- Reset: **Reset demo** restores the bundled values and result.
- Exit: **Start for real**, another site link, browser Back, or a later non-demo page removes the demo key. Real-prefixed data remains untouched.

The browser demo sends no telemetry sample or model input over the network.
Its service worker caches only same-origin public site files for offline use.

## CLI demo

Run:

```sh
cplab demo
```

The binary copies `examples/collector.yaml` and `examples/traces.ndjson` to a new system temporary directory.
It starts a temporary loopback receiver, replays the sample at 20 and 100 requests/s, and writes `report.json` there.
The command prints the directory and writes nothing to the current directory.

The landing-page terminal panel is a captioned recording of this command and its representative output.
