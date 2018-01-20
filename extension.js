const vscode = require('vscode');
const pomodoro = require('./pomodoro');
const commands = require('./commands');

const pomodoroTimer = new pomodoro.PomodoroTimer();

function activate(context) {
    let startTimer = vscode.commands.registerCommand(commands.START_TIMER_CMD, () => {
        pomodoroTimer.start();
    });
    let pauseTimer = vscode.commands.registerCommand(commands.PAUSE_TIMER_CMD, () => {
        pomodoroTimer.pause();
    });
    let stopTimer = vscode.commands.registerCommand(commands.STOP_TIMER_CMD, () => {
        pomodoroTimer.stop();
    });

    context.subscriptions.push([startTimer, stopTimer, pauseTimer]);
}
exports.activate = activate;

function deactivate() {
    pomodoroTimer.dispose();
}
exports.deactivate = deactivate;