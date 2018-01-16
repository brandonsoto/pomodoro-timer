const vscode = require('vscode');

function createStatusBarItem() {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = "";
    statusBarItem.command = "extension.showAll";
    statusBarItem.show();
    return statusBarItem;
}

class PomodoroTimer {
    constructor(interval=5000) { // TODO: change default to 25 minutes for release
        this.name = "Pomodoro";
        this.interval = vscode.workspace.getConfiguration("pomodoro").get("interval", interval);
        this.timeout = null;
        this.icon = '$(clock)';
        this.statusBarItem = createStatusBarItem();
        this.endDate = null;
        this.secondsLeft = null;
    }

    start() {
        let onSecondElapsed = () => {
            if (this.endDate) {
                const timeLeft = Math.ceil( (this.endDate.getTime() - Date.now().valueOf()) / 1000 );
                this.statusBarItem.text = this.icon + " " + timeLeft;
            }
        }

        if (!this.timeout) {
            console.log(this.name + ' is starting');

            this.endDate = new Date(Date.now().valueOf() + this.interval);
            this.timeout = setTimeout(() => { this.stop(); }, this.interval);
            this.secondsLeft = setInterval(onSecondElapsed, 1000);
            this.statusBarItem.color = "green";

            return true;
        }

        return false;
    }

    stop() {
        if (this.timeout) {
            console.log(this.name + ' is stopping');

            clearTimeout(this.timeout);
            clearInterval(this.secondsLeft);

            this.statusBarItem.color = "red";
            this.timeout = null;
            this.secondsLeft = null;

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