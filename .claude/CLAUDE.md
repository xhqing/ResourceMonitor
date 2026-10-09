# Resource Monitor — 项目说明

VSCode 扩展：实时监控整台 Mac 的 CPU / 内存 / 磁盘资源，用 AI 把数据翻译成可勾选的清理动作并安全执行。

> 本项目是 **DeviceStewardAgent（Alfred）的子项目**。以下为 DeviceStewardAgent（Alfred）`.claude/CLAUDE.md` 全文，其中「本项目」均指 DeviceStewardAgent；ResourceMonitor 自身的项目说明以上方内容为准（`.claude/` 超集关系：DeviceStewardAgent 为权威源、ResourceMonitor 为其超集，2026-08-10 全局规则）。

---

# DeviceStewardAgent — Agent 项目说明

**拟人名**：Alfred
**职称**：电脑管家（Device Steward Agent）
**团队项目名**：DeviceStewardAgent
**仓库**：xhqing/DeviceStewardAgent

本项目是 Agent 项目，定位为「电脑管家 Alfred」——职责是**资源管理**：本地电脑 / 远程服务器 / 云电脑的资源监控与管理建议（进程 / 内存 / 存储治理），目标是让各设备始终处于低负载的流畅工作状态。名字取自 DC 漫画中蝙蝠侠的管家 Alfred Pennyworth——可靠、周到、把一切打理得井井有条。独立于销售流水线，为全团队的 agent 提供设备资源保障。

## 目录结构

- 根目录 README：Agent 项目（Alfred）对外说明，指向子项目 ResourceMonitor 的工具文档。
- `.claude/`：本项目独有的能力与配置目录（settings 等）。**不放与全局重复的通用能力**——通用 skills / rules 从全局 `~/.claude/` 或 CapabilityManagerAgent 的 `claude/` 开源镜像获取（「通用能力开源单一出口」规则，2026-08-09 立）。
- `.codebuddy/CODEBUDDY.md`：CodeBuddy 项目说明（一行引用 `../.claude/CLAUDE.md`，单一来源）。
- 工具本体在子项目 **ResourceMonitor**（[xhqing/ResourceMonitor](https://github.com/xhqing/ResourceMonitor)，VSCode 扩展：整机资源监控 + AI 清理建议）。

## 子项目清单（`.claude/` 超集关系）

本项目（Alfred）负责维护以下子项目，`.claude/` 与子项目 `.claude/` 之间维护「Agent 项目为权威源、子项目为超集」的关系（全局规则「Agent 项目与子项目的 `.claude/` 超集关系」，2026-08-10 立）：本文件全文随附进子项目 `.claude/CLAUDE.md`，其中「本项目」均指 DeviceStewardAgent。

- **DeviceStewardAgent（Alfred）→ ResourceMonitor**：独立仓库 [xhqing/ResourceMonitor](https://github.com/xhqing/ResourceMonitor)，VSCode 扩展——实时监控整台 Mac 的 CPU / 内存 / 磁盘资源，用 AI 把数据翻译成可勾选的清理动作并安全执行。

## commit skill 检测缓存

<!-- commit-skill: readme-standard = ok -->
- README 中英双语 + LOGO + 徽章 + 版权署名：已就绪（2026-08-20 立项时按团队徽章标准一次到位：License / Version / Type 三枚 + Visitors 访问量徽章）

<!-- commit-skill: license = ok -->
- LICENSE.md：已存在，无冗余（2026-08-20 立项）

<!-- commit-skill: github-about = ok -->
- GitHub About：已配置于 xhqing/DeviceStewardAgent（中英双语 description + topics，2026-08-20）

<!-- commit-skill: attribution-name = ok -->
- 版权人/署名引用名字：已归一为 All Contributors（2026-08-20 立项）

<!-- commit-skill: readme-link-text = ok -->
- 英文版 README 跳转中文版链接文字：已统一为「简体中文」（2026-08-20 立项）

<!-- commit-skill: repo-sponsors = ok -->
- 仓库 Sponsors 按钮：已就绪（xhqing/.github 全局默认 FUNDING.yml，2026-08-20 确认）

## 跳过的检测项及原因

- **automemory（9e）**：按全局 `~/.claude/CLAUDE.md` 约定（2026-07-20 立），AutoMemory 全局已禁用（`autoMemoryEnabled: false`），新建项目一律不配 AutoMemory。故本项目不创建 `.claude/memory/`、不写 `autoMemoryDirectory`、`.gitignore` 不挂 memory 条目，9e 永久跳过。
