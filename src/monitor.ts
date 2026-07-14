import * as cp from 'child_process';
import * as vscode from 'vscode';
import { Alerter } from './alerter';
import { sampleProcess, resolveCaptureDir } from './sampler';

// 一个被监控的渲染进程
export interface RendererProc {
  pid: number;
  cpu: number;
  editor: 'vscode' | 'trae' | 'other';
}

// 仅 macOS：通过命令行特征区分编辑器来源
function detectEditor(command: string): RendererProc['editor'] {
  if (command.includes('Visual Studio Code')) return 'vscode';
  if (command.includes('Trae')) return 'trae';
  return 'other';
}

// 监控器：定时巡检渲染进程 CPU，更新状态栏，超阈值委托 Alerter
export class Monitor {
  private timer: NodeJS.Timeout | undefined;
  private readonly statusItem: vscode.StatusBarItem;
  private readonly alerter: Alerter;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusItem.command = 'resourceMonitor.sampleTopProcess';
    this.statusItem.tooltip = 'Resource Monitor：点击抓取最吃 CPU 的渲染进程调用栈';
    this.statusItem.text = '$(pulse) CPU --';
    this.statusItem.show();
    context.subscriptions.push(this.statusItem);

    this.alerter = new Alerter(this.cfg().cooldown, async (t) => {
      await sampleProcess(context, t);
    });
  }

  private cfg() {
    const c = vscode.workspace.getConfiguration('resourceMonitor');
    return {
      threshold: c.get<number>('threshold', 100)!,
      interval: c.get<number>('interval', 3)!,
      cooldown: c.get<number>('alertCooldown', 30)!,
    };
  }

  start() {
    if (this.timer) return;
    const interval = this.cfg().interval * 1000;
    const tick = () => { this.poll(); };
    this.timer = setInterval(tick, interval);
    tick();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.statusItem.text = '$(circle-slash) RM 已停止';
  }

  private async poll() {
    try {
      this.alerter.setCooldown(this.cfg().cooldown);
      const { threshold } = this.cfg();
      const procs = await this.listRenderers();
      if (procs.length === 0) {
        this.statusItem.text = '$(pulse) 无渲染进程';
        return;
      }
      const top = procs.reduce((a, b) => (a.cpu > b.cpu ? a : b));
      const icon = top.cpu >= threshold ? '$(flame)' : '$(pulse)';
      this.statusItem.text = `${icon} ${top.editor}:${top.pid} ${Math.round(top.cpu)}%`;
      this.statusItem.tooltip =
        `Resource Monitor\n最吃 CPU 的渲染进程：${top.editor} PID ${top.pid}（${Math.round(top.cpu)}%）\n点击抓栈`;

      await this.alerter.maybeAlert(
        { pid: top.pid, cpu: top.cpu, editor: top.editor },
        threshold,
      );
    } catch {
      // 巡检循环内静默，避免单次异常刷屏
    }
  }

  // 跑 ps 取所有 Helper (Renderer) 进程
  private async listRenderers(): Promise<RendererProc[]> {
    return new Promise((resolve) => {
      cp.execFile('ps', ['-ww', '-A', '-o', 'pid=,pcpu=,command='], (err, stdout) => {
        if (err) { resolve([]); return; }
        const out: RendererProc[] = [];
        for (const line of stdout.split('\n')) {
          if (!line.includes('Helper (Renderer)')) continue;
          const m = line.trim().match(/^(\d+)\s+([\d.]+)\s+(.*)$/);
          if (!m) continue;
          out.push({ pid: Number(m[1]), cpu: Number(m[2]), editor: detectEditor(m[3]) });
        }
        resolve(out);
      });
    });
  }

  // 命令：手动抓取当前最吃 CPU 的渲染进程
  async sampleTopProcess() {
    const procs = await this.listRenderers();
    if (procs.length === 0) {
      vscode.window.showInformationMessage('没有发现渲染进程。');
      return;
    }
    const top = procs.reduce((a, b) => (a.cpu > b.cpu ? a : b));
    await sampleProcess(this.context, { pid: top.pid, cpu: top.cpu, editor: top.editor });
  }

  // 命令：在 Finder 中打开抓栈产物目录
  openCaptures() {
    const dir = resolveCaptureDir(this.context);
    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(dir));
  }
}
