const vscode = require('vscode');

const EXTENSION_NAME = "Pomodoro";
const INTERVAL = 5000;

function activate(context) {
    console.log(EXTENSION_NAME + ' is now active');
    let timeout = undefined;

    let startTimer = vscode.commands.registerCommand('extension.startTimer', function () {
        console.log(EXTENSION_NAME + ' is starting timer');
        if (timeout === undefined) {
            timeout = setTimeout(onPomodoroExpired, INTERVAL);
        }
    });
    let stopTimer = vscode.commands.registerCommand('extension.stopTimer', function () {
        console.log(EXTENSION_NAME + ' is stopping timer');
        if (timeout !== undefined) {
            clearTimeout(timeout);
            timeout = undefined;
        }
    });

    function onPomodoroExpired() {
        timeout = undefined;
        vscode.window.showInformationMessage(EXTENSION_NAME + ' expired');
        console.log(EXTENSION_NAME + ' period expired!');
    }

    context.subscriptions.push([startTimer, stopTimer]);
}
exports.activate = activate;

function deactivate() {
    console.log(EXTENSION_NAME + ' is deactivated');
}
exports.deactivate = deactivate;