const vscode = require('vscode');

let extensionName = "Pomodoro";

function activate(context) {
    console.log(extensionName + ' is now active');

    let startTimer = vscode.commands.registerCommand('extension.startTimer', function () {
        console.log(extensionName + ' is starting timer');
        vscode.window.showInformationMessage('Starting Timer');
    });
    let stopTimer = vscode.commands.registerCommand('extension.stopTimer', function () {
        console.log(extensionName + ' is stopping timer');
        vscode.window.showInformationMessage('Stopping Timer');
    });


    context.subscriptions.push([startTimer, stopTimer]);
}
exports.activate = activate;

function deactivate() {
    console.log(extensionName + ' is deactivated');
}
exports.deactivate = deactivate;