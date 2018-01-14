const vscode = require('vscode');

class PomodoroTimer {
    constructor(interval) {
        this.name = "Pomodoro";
        this.interval = interval;
        this.timeout = null;
        this.icon = '$(clock)';
        this.statusBarItem = PomodoroTimer.createStatusBarItem();
    }

    static createStatusBarItem() {
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

            return true;
        }

        return false;
    }

    stop() {
        if (this.timeout) {
            console.log(this.name + ' is stopping');

            clearTimeout(this.timeout);
            this.timeout = null;
            this.setStatusText("stopped", "red");

            return true;
        }

        return false;
    }

    dispose() {
        if (this.statusBarItem) {
            this.statusBarItem.hide();
            this.statusBarItem.dispose();
            this.statusBarItem = null;
        }
    }
};
exports.PomodoroTimer = PomodoroTimer;