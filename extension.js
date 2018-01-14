const vscode = require('vscode');
const pomodoro = require('./pomodoro');

const pomodoroTimer = new pomodoro.PomodoroTimer(5000);

function activate(context) {
    console.log(pomodoroTimer.name + ' now active');

    let startTimer = vscode.commands.registerCommand('extension.startTimer', function () {
        pomodoroTimer.start();
    });
    let stopTimer = vscode.commands.registerCommand('extension.stopTimer', function () {
        pomodoroTimer.stop();
    });

    context.subscriptions.push([startTimer, stopTimer]);
}
exports.activate = activate;

function deactivate() {
    console.log(pomodoroTimer.name + ' deactivated');

    pomodoroTimer.dispose();
}
exports.deactivate = deactivate;