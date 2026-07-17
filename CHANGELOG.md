# Changelog

本文件记录 Resource Monitor 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [0.0.1] - 2026-07-17

首个版本：实时监控 VSCode 渲染进程 CPU，超阈值告警并一键抓取调用栈。

### Added

- **渲染进程 CPU 监控**：按可配置间隔巡检各渲染进程占用，单个进程超过阈值即弹出告警。
- **一键抓栈**：抓取最吃 CPU 的渲染进程调用栈，用于定位 V8/GC、Blink 重绘或扩展 webview 热点；采样时长可配，产物默认存扩展私有目录，亦可存工作区目录。
- **告警冷却**：同一进程两次告警之间设冷却时间，避免告警轰炸。
- **命令**：开始监控、停止监控、抓取最吃 CPU 的渲染进程、打开抓栈产物目录。
- **配置项**：`resourceMonitor.threshold`（CPU 阈值）、`interval`（巡检间隔）、`sampleDuration`（采样时长）、`alertCooldown`（告警冷却）、`captureToWorkspace`（产物存放位置）。
- **文档与包装**：中英双语 README、MIT LICENSE.md、Logo 与标准徽章。
- **工程脚手架**：Claude Code 本地配置（AutoMemory 目录、通用规则、命令）、项目 CLAUDE.md（commit skill 检测缓存）。
