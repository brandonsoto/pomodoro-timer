const vscode = require('vscode');

class PomodoroTimer {
    constructor(interval) {
        this.name = "Pomodoro";
        this.interval = interval;
        this.timeout = undefined;
        this.statusBarItem = this.createStatusBarItem();
    }

    createStatusBarItem() {
        let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = this.icon + " " + this.name;
        statusBarItem.show();
        return statusBarItem;
    }

    setStatusText(text, color="black") {
        this.statusBarItem.text = "$(clock) " + this.name +  " " + text;
        this.statusBarItem.color = color;
    }

    start() {
        let onExpired = () => {
            console.log(this.name + ' expired');

            this.timeout = undefined;
            this.setStatusText("expired", "yellow");
        };

        if (!this.timeout) {
            console.log(this.name + ' is starting');

            this.timeout = setTimeout(onExpired, this.interval);
            this.setStatusText("started", "green");
        }
    }

    stop() {
        if (!this.timeout) {
            console.log(this.name + ' is stopping');

            clearTimeout(this.timeout);
            this.timeout = undefined;
            this.setStatusText("stopped", "red");
        }
    }

    dispose() {
        this.statusBarItem.hide();
        this.statusBarItem.dispose();
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

    pomodoroTimer.dispose();
}
exports.deactivate = deactivate;