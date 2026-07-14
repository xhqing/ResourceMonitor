import * as vscode from 'vscode';
import { Monitor } from './monitor';

let monitor: Monitor | undefined;

// 扩展激活入口：注册命令、创建监控器并自动启动
export function activate(context: vscode.ExtensionContext) {
  monitor = new Monitor(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('resourceMonitor.start', () => {
      monitor!.start();
      vscode.window.showInformationMessage('Resource Monitor 已开始监控。');
    }),
    vscode.commands.registerCommand('resourceMonitor.stop', () => {
      monitor!.stop();
      vscode.window.showInformationMessage('Resource Monitor 已停止。');
    }),
    vscode.commands.registerCommand('resourceMonitor.sampleTopProcess', () => monitor!.sampleTopProcess()),
    vscode.commands.registerCommand('resourceMonitor.openCaptures', () => monitor!.openCaptures()),
  );

  monitor.start();
}

export function deactivate() {
  monitor?.stop();
}
