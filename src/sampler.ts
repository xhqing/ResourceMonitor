import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface SampleTarget {
  pid: number;
  cpu: number;
  editor: string;
}

// 解析抓栈产物目录：默认扩展私有存储；可选写到工作区 ./resource-monitor-captures
export function resolveCaptureDir(context: vscode.ExtensionContext): string {
  const cfg = vscode.workspace.getConfiguration('resourceMonitor');
  const toWorkspace = cfg.get<boolean>('captureToWorkspace', false);
  if (toWorkspace && vscode.workspace.workspaceFolders?.[0]) {
    const dir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'resource-monitor-captures');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  const dir = path.join(context.globalStorageUri.fsPath, 'captures');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// 调用 macOS `sample` 抓取目标进程调用栈，写入文件后提示打开
export async function sampleProcess(context: vscode.ExtensionContext, t: SampleTarget): Promise<void> {
  const dur = vscode.workspace.getConfiguration('resourceMonitor').get<number>('sampleDuration', 3)!;
  const dir = resolveCaptureDir(context);
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(dir, `${ts}_${t.editor}_pid${t.pid}_cpu${Math.round(t.cpu)}.txt`);

  vscode.window.showInformationMessage(`正在抓取 PID ${t.pid} 的调用栈（${dur}s）…`);
  await new Promise<void>((resolve) => {
    cp.execFile('sample', [String(t.pid), String(dur), '-file', file], (err) => {
      if (err) {
        vscode.window.showErrorMessage(`抓栈失败：${err.message}（确认已安装 Xcode 命令行工具：xcode-select --install）`);
      } else {
        vscode.window.showInformationMessage(`抓栈完成：${file}`, '打开').then((c) => {
          if (c === '打开') {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(file));
          }
        });
      }
      resolve();
    });
  });
}
