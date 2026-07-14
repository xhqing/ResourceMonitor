import * as vscode from 'vscode';

export interface AlertTarget {
  pid: number;
  cpu: number;
  editor: string;
}

// 告警器：带冷却地弹出告警，用户点「抓栈」时回调 sampler
// 冷却按 pid 记忆，避免同一进程在短时间内反复轰炸
export class Alerter {
  private cooldownSec: number;
  private readonly lastAlertAt = new Map<number, number>();

  constructor(cooldownSec: number, private readonly onSample: (t: AlertTarget) => Promise<void>) {
    this.cooldownSec = cooldownSec;
  }

  setCooldown(sec: number) {
    this.cooldownSec = sec;
  }

  // 返回是否真的弹了告警（用于测试/调试）
  async maybeAlert(t: AlertTarget, threshold: number): Promise<boolean> {
    if (t.cpu < threshold) return false;
    const now = Date.now();
    const last = this.lastAlertAt.get(t.pid) ?? 0;
    if (now - last < this.cooldownSec * 1000) return false;
    this.lastAlertAt.set(t.pid, now);

    const choice = await vscode.window.showWarningMessage(
      `⚠️ ${t.editor} 渲染进程 PID ${t.pid} CPU ${Math.round(t.cpu)}% ≥ ${threshold}%`,
      '抓栈',
    );
    if (choice === '抓栈') {
      await this.onSample(t);
    }
    return true;
  }
}
