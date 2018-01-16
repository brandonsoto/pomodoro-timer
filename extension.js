const vscode = require('vscode');
const pomodoro = require('./pomodoro');
const diff = require('./diff');

const pomodoroTimer = new pomodoro.PomodoroTimer();
const documentDiffs = new diff.DocumentDiffs();

function fakeDocumentUpdates() {
    documentDiffs.update({"fileName": "a", "lineCount": 72 });
    documentDiffs.update({"fileName": "b", "lineCount": 72 });
    documentDiffs.update({"fileName": "b", "lineCount": 44 });
    documentDiffs.update({"fileName": "c", "lineCount": 1 });
    documentDiffs.update({"fileName": "c", "lineCount": 130 });
}

function activate(context) {
    console.log(pomodoroTimer.name + ' now active');

    let startTimer = vscode.commands.registerCommand('extension.startTimer', () => {
        pomodoroTimer.start();
        documentDiffs.clear();
        fakeDocumentUpdates(); // TODO: used for debugging; remove before release
    });
    let stopTimer = vscode.commands.registerCommand('extension.stopTimer', () => {
        pomodoroTimer.stop();
        console.log("total changes =" + documentDiffs.total());
        documentDiffs.clear();
    });

    // TODO: reenable when finished debugging
    // vscode.workspace.onDidChangeTextDocument((ev)=>{
    //     documentDiffs.update(ev.document);
    // });

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