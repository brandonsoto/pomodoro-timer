const vscode = require('vscode');

class PomodoroTimer {
    constructor(interval) {
        this.name = "Pomodoro";
        this.interval = interval;
        this.timeout = null;
        this.icon = '$(clock)';
        this.statusBarItem = this.createStatusBarItem();
    }

    createStatusBarItem() {
        let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "";
        statusBarItem.show();
        return statusBarItem;
    }

    setStatusText(text, color="black") {
        this.statusBarItem.text = this.icon + " " + this.name +  " " + text;
        this.statusBarItem.color = color;
    }

    start() {
        let onExpired = () => {
            console.log(this.name + ' expired');
            this.stop();
        };

        if (!this.timeout) {
            console.log(this.name + ' is starting');

            this.timeout = setTimeout(onExpired, this.interval);
            this.setStatusText("started", "green");
        }
    }

    stop() {
        if (this.timeout) {
            console.log(this.name + ' is stopping');

            clearTimeout(this.timeout);
            this.timeout = null;
            this.setStatusText("stopped", "red");
        }
    }

    dispose() {
        this.statusBarItem.hide();
        this.statusBarItem.dispose();
    }
};
exports.PomodoroTimer = PomodoroTimer;