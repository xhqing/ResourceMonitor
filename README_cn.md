<div align="center">

<img src="assets/logo.svg" width="640" alt="Resource Monitor logo" />

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-19C37D)
![Type](https://img.shields.io/badge/Type-VSCode%20Extension-0078D4)

</div>

# Resource Monitor

> VSCode 扩展：实时监控渲染进程 CPU，超阈值告警并一键抓取调用栈，定位 V8/GC、Blink 重绘或扩展 webview 热点。

[English](README.md)

## 为什么需要

8GB 内存的小机器跑 VSCode（或 Trae 等 fork）偶尔卡顿，元凶往往在「渲染进程」之间游走——一会儿这个 renderer 飙到 200%，一会儿换另一个。本扩展持续盯住所有渲染进程，谁飙高就告警并抓栈，让卡顿可被归因。

## 功能

- **状态栏实时显示**：当前最吃 CPU 的渲染进程（`编辑器:PID CPU%`）
- **超阈值告警**：单个渲染进程 CPU 超过阈值时弹通知，可一键抓栈
- **一键抓栈**：调用 macOS `sample` 抓取目标进程调用栈，写入文件
- **冷却节流**：同一进程在冷却时间内不重复告警，避免轰炸

## 平台要求

- **macOS**（依赖 `ps` 与 `sample`）
- `sample` 命令需 Xcode 命令行工具：`xcode-select --install`

## 快速开始（开发调试）

```bash
npm install
npm run build      # 或 npm run watch 持续构建
# 在 VSCode 里按 F5 打开扩展开发宿主窗口
```

打包成 `.vsix` 安装：

```bash
npm install -g @vscode/vsce
npm run package
# 在 VSCode「扩展 → 从 VSIX 安装」选择 dist/*.vsix
```

## 命令

| 命令 | 说明 |
|---|---|
| Resource Monitor: 开始监控 | 启动巡检 |
| Resource Monitor: 停止监控 | 停止巡检 |
| Resource Monitor: 抓取最吃 CPU 的渲染进程 | 手动抓栈（状态栏点击同此） |
| Resource Monitor: 打开抓栈产物目录 | 在 Finder 中打开 |

## 配置

| 项 | 默认 | 说明 |
|---|---|---|
| `resourceMonitor.threshold` | `100` | 触发告警的 CPU% 阈值 |
| `resourceMonitor.interval` | `3` | 巡检间隔（秒） |
| `resourceMonitor.sampleDuration` | `3` | 抓栈时长（秒） |
| `resourceMonitor.alertCooldown` | `30` | 同进程告警冷却（秒） |
| `resourceMonitor.captureToWorkspace` | `false` | 抓栈产物是否写工作区目录（`./resource-monitor-captures`） |

## 抓栈结果怎么读

打开 capture 文件，看 `Sort by: cpu` 的热点函数前缀：

- `v8::` / `CollectGarbage` / `Heap` → **V8 GC 风暴**（通常指向内存压力）
- `blink::` / `Paint` / `Layout` / `Compositing` → **Blink 重绘/重排**（webview 频繁刷新、大文件、复杂装饰）
- 出现特定扩展名 → 锁定到该扩展

## 实现要点

- `src/monitor.ts`：`ps` 巡检循环 + 状态栏
- `src/alerter.ts`：带冷却的告警（按 pid 记忆）
- `src/sampler.ts`：调用 `sample` 抓栈并落盘

## 版权与署名

版权所有 (c) 2026 All Contributors，基于 [MIT 协议](LICENSE.md)授权。

**署名方式**：如果本项目对你有帮助，欢迎在 GitHub 点 ⭐，并请保留版权声明。衍生作品中请注明来源「Resource Monitor (https://github.com/xhqing/ResourceMonitor)」。

**引用本项目**：

```
Resource Monitor — VSCode 渲染进程 CPU 监控扩展。
https://github.com/xhqing/ResourceMonitor
```
