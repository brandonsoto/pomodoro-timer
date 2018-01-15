const vscode = require('vscode');
const pomodoro = require('./pomodoro');
const diff = require('./diff');

const pomodoroTimer = new pomodoro.PomodoroTimer();
const documentDiffs = new diff.DocumentDiffs();

function activate(context) {
    console.log(pomodoroTimer.name + ' now active');

    let startTimer = vscode.commands.registerCommand('extension.startTimer', () => {
        pomodoroTimer.start();
        documentDiffs.clear();
    });
    let stopTimer = vscode.commands.registerCommand('extension.stopTimer', () => {
        pomodoroTimer.stop();
        console.log("total changes =" + documentDiffs.total());
        documentDiffs.clear();
    });

    vscode.workspace.onDidChangeTextDocument((ev)=>{
        documentDiffs.update(ev.document);
    });

    // TODO: is there a cleaner way to accomplish this?
    let showAll = vscode.commands.registerCommand('extension.showAll', () => {
        vscode.window.showQuickPick(['Start Timer', 'Stop Timer'])
            .then((pick) => {
                if (pick === "Start Timer")
                    vscode.commands.executeCommand("extension.startTimer");
                else if (pick === "Stop Timer")
                    vscode.commands.executeCommand("extension.stopTimer");
            });
    });

    context.subscriptions.push([startTimer, stopTimer, showAll]);
}
exports.activate = activate;

function deactivate() {
    console.log(pomodoroTimer.name + ' deactivated');

    pomodoroTimer.dispose();
}
exports.deactivate = deactivate;