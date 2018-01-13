const vscode = require('vscode');

function activate(context) {
    console.log('Pomodoro is now active');

    let startTimer = vscode.commands.registerCommand('extension.startTimer', function () {
        vscode.window.showInformationMessage('Starting Timer');
    });
    let stopTimer = vscode.commands.registerCommand('extension.stopTimer', function () {
        vscode.window.showInformationMessage('Stopping Timer');
    });


    context.subscriptions.push([startTimer, stopTimer]);
}
exports.activate = activate;

function deactivate() {
    console.log('Pomodoro is deactivated');
}
exports.deactivate = deactivate;