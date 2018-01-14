const vscode = require('vscode');

class PomodoroTimer {
    constructor(interval) {
        this.name = "Pomodoro";
        this.interval = interval;
        this.timeout = undefined;
    }

    start() {
        let onExpired = () => {
            this.timeout = undefined;
            vscode.window.showInformationMessage(this.name + ' expired');
            console.log(this.name + ' period expired!');
        };

        console.log(this.name + ' is starting');

        if (this.timeout === undefined) {
            this.timeout = setTimeout(onExpired, this.interval);
        }
    }

    stop() {
        console.log(this.name + ' is stopping');
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
};

const pomodoroTimer = new PomodoroTimer(5000);

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
}
exports.deactivate = deactivate;