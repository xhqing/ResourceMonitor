import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { Snapshot } from './snapshot';
import { readConfig } from './config';
import { buildHtml } from './template';
import { CleanerSuggestion } from './ai/types';
import { executeClean, CleanResult } from './cleaner';

// 侧边栏 WebviewView（活动栏点图标即展开，不再走中央编辑器面板）：
// 整机仪表盘 + 阈值/告警间隔可调 + AI 清理建议 + 勾选执行。
// 视图未展开时，扩展端缓存最新快照/建议，等 resolve 时刷进去，避免开屏空白。
export class PanelController implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;
  private lastSnapshot: Snapshot | undefined;
  private suggestions: CleanerSuggestion[] = [];

  constructor(private readonly onDiagnose: () => void) {}

  // VSCode 在视图首次显示（用户点活动栏图标展开，或命令面板触发 focus）时调用一次。
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    const cfg = readConfig();
    webviewView.webview.html = buildHtml({
      thresholds: cfg.thresholds,
      cooldown: cfg.alertCooldownSec,
      nonce: getNonce(),
    });
    webviewView.webview.onDidReceiveMessage((msg: PanelMessage) => this.handleMessage(msg));
    webviewView.onDidDispose(() => {
      this.view = undefined;
    });

    // 把扩展端缓存的最新数据刷进去，保证开屏即有内容。
    if (this.lastSnapshot) {
      webviewView.webview.postMessage({ type: 'snapshot', snap: this.lastSnapshot });
    }
    if (this.suggestions.length) {
      webviewView.webview.postMessage({ type: 'suggestions', items: this.suggestions });
    }
  }

  // 由 openPanel 命令调用：展开/聚焦本侧边栏视图，并刷新一帧最新数据。
  show(initial?: Snapshot) {
    if (initial) {
      this.lastSnapshot = initial;
      this.update(initial);
    }
  }

  // 命令面板「打开资源面板」入口：确保视图可见（未 resolve 时触发 focus 命令展开）。
  async reveal() {
    if (this.view) {
      this.view.show?.(true);
    } else {
      await vscode.commands.executeCommand(`${VIEW_ID}.focus`);
    }
  }

  update(snap: Snapshot) {
    this.lastSnapshot = snap;
    this.view?.webview.postMessage({ type: 'snapshot', snap });
  }

  setSuggestions(items: CleanerSuggestion[]) {
    this.suggestions = items;
    this.view?.webview.postMessage({ type: 'suggestions', items });
  }

  private handleMessage(msg: PanelMessage) {
    const cfg = vscode.workspace.getConfiguration('resourceMonitor');
    switch (msg.type) {
      case 'updateThreshold':
        void cfg.update(`threshold.${msg.key}`, msg.value, vscode.ConfigurationTarget.Global);
        break;
      case 'updateCooldown':
        void cfg.update('alertCooldown', msg.value, vscode.ConfigurationTarget.Global);
        break;
      case 'diagnose':
        this.onDiagnose();
        break;
      case 'executeClean':
        void this.runClean(msg.commands);
        break;
    }
  }

  // 执行勾选的清理项：点击按钮即确认，不再二次弹窗，直接过白名单执行。
  private async runClean(commands: string[]) {
    const picked = commands
      .map((cmd) => this.suggestions.find((s) => s.command === cmd))
      .filter((s): s is CleanerSuggestion => Boolean(s));
    if (picked.length === 0) {
      void vscode.window.showWarningMessage('没有勾选任何清理项。');
      return;
    }

    const results: CleanResult[] = [];
    for (const s of picked) {
      results.push(await executeClean(s));
    }

    this.view?.webview.postMessage({ type: 'cleanResults', results });
    const ok = results.filter((r) => r.success).length;
    void vscode.window.showInformationMessage(`清理完成：成功 ${ok}/${results.length} 项，详见面板。`);
  }
}

const VIEW_ID = 'resourceMonitor.entry';

type PanelMessage =
  | { type: 'updateThreshold'; key: string; value: number }
  | { type: 'updateCooldown'; value: number }
  | { type: 'diagnose' }
  | { type: 'executeClean'; commands: string[] };

function getNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}
