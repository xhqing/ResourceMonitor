<div align="center">

<img src="assets/logo.svg" width="640" alt="Resource Monitor logo" />

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-19C37D)
![Type](https://img.shields.io/badge/Type-VSCode%20Extension-0078D4)

</div>

# Resource Monitor

> VSCode extension that monitors renderer-process CPU in real time, alerts on threshold breach, and captures call stacks in one click to pinpoint V8/GC, Blink repaint, or extension webview hotspots.

[中文](README_cn.md)

## Why

Small machines with 8GB RAM running VSCode (or forks like Trae) occasionally stutter, and the culprit often roams across renderer processes — one renderer spikes to 200%, then another. This extension keeps watch over all renderer processes, alerts and captures stacks from whichever spikes, so the stuttering can be attributed.

## Features

- **Live status bar**: the most CPU-hungry renderer (`Editor:PID CPU%`)
- **Threshold alerts**: notify when a single renderer's CPU exceeds the threshold, with one-click stack capture
- **One-click stack capture**: invokes macOS `sample` to capture the target process's call stack to a file
- **Cooldown throttling**: no repeated alerts for the same process within the cooldown window

## Platform requirements

- **macOS** (depends on `ps` and `sample`)
- `sample` requires Xcode Command Line Tools: `xcode-select --install`

## Quick start (development)

```bash
npm install
npm run build      # or npm run watch for continuous build
# In VSCode, press F5 to open the Extension Development Host
```

Package as `.vsix` and install:

```bash
npm install -g @vscode/vsce
npm run package
# In VSCode: "Extensions → Install from VSIX", pick dist/*.vsix
```

## Commands

| Command | Description |
|---|---|
| Resource Monitor: Start Monitoring | Start polling |
| Resource Monitor: Stop Monitoring | Stop polling |
| Resource Monitor: Sample top CPU renderer | Manual stack capture (same as status bar click) |
| Resource Monitor: Open captures folder | Open in Finder |

## Configuration

| Option | Default | Description |
|---|---|---|
| `resourceMonitor.threshold` | `100` | CPU% threshold to trigger an alert |
| `resourceMonitor.interval` | `3` | Polling interval (seconds) |
| `resourceMonitor.sampleDuration` | `3` | Stack sampling duration (seconds) |
| `resourceMonitor.alertCooldown` | `30` | Per-process alert cooldown (seconds) |
| `resourceMonitor.captureToWorkspace` | `false` | Write captures to a workspace folder (`./resource-monitor-captures`) |

## Reading capture results

Open the capture file and look at the `Sort by: cpu` hot function prefixes:

- `v8::` / `CollectGarbage` / `Heap` → **V8 GC storm** (usually points to memory pressure)
- `blink::` / `Paint` / `Layout` / `Compositing` → **Blink repaint/reflow** (frequent webview refresh, large files, complex decorations)
- A specific extension name → pinpoints that extension

## Implementation notes

- `src/monitor.ts`: `ps` polling loop + status bar
- `src/alerter.ts`: cooldown-aware alerts (per-pid memory)
- `src/sampler.ts`: invokes `sample` to capture stacks and persist them

## License & Attribution

Copyright (c) 2026 All Contributors. Licensed under the [MIT License](LICENSE.md).

**Attribution**: If this project helps you, a ⭐ on GitHub and retaining the copyright notice are appreciated. In derived works, please credit "Resource Monitor (https://github.com/xhqing/ResourceMonitor)".

**Citing this project**:

```
Resource Monitor — VSCode extension for renderer-process CPU monitoring.
https://github.com/xhqing/ResourceMonitor
```
