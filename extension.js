const vscode = require('vscode');
const pomodoro = require('./pomodoro');
const commands = require('./commands');

const pomodoroTimer = new pomodoro.PomodoroTimer();

function activate(context) {
    console.log(pomodoroTimer.name + ' now active');

    let startTimer = vscode.commands.registerCommand(commands.START_TIMER_CMD, () => {
        pomodoroTimer.start();
    });
    let pauseTimer = vscode.commands.registerCommand(commands.PAUSE_TIMER_CMD, () => {
        pomodoroTimer.pause();
    });
    let stopTimer = vscode.commands.registerCommand(commands.STOP_TIMER_CMD, () => {
        pomodoroTimer.stop();
    });

    context.subscriptions.push([startTimer, stopTimer, pauseTimer, resumeTimer]);
}
exports.activate = activate;

function deactivate() {
    console.log(pomodoroTimer.name + ' deactivated');

    pomodoroTimer.dispose();
}
exports.deactivate = deactivate;