const vscode = require('vscode');
const commands = require('./commands');

function createStatusBarItem() {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.show();
    return statusBarItem;
}

var TimerState = {
    UNKNOWN: 0,
    INITIALIZED: 1,
    RUNNING: 2,
    PAUSED: 3,
    FINISHED: 4,
    RESTARTED: 5,
    DISPOSED: 6
}
exports.TimerState = TimerState;

class PomodoroTimer {
    constructor(interval=5000) { // TODO: change default to 25 minutes for release
        this.name = "Pomodoro";
        this.interval = vscode.workspace.getConfiguration("pomodoro").get("interval", interval);
        this.timeout = 0;
        this.statusBarItem = createStatusBarItem();
        this.endDate = new Date();
        this.secondsLeft = 0;
        this.state = TimerState.INITIALIZED;
        this.formatStatusBar();
    }

    formatStatusBar() {
        const timeLeft = Math.ceil( (this.endDate.getTime() - Date.now().valueOf()) / 1000 ); // TODO: this should be formatted like 00:00
        const icon = TimerState.RUNNING === this.state ? "$(primitive-square)" : "$(triangle-right)";
        this.statusBarItem.text = icon + " " + timeLeft;
    }

    //TODO: should there be any other start states?
    inStartableState() {
        return TimerState.FINISHED === this.state
            || TimerState.INITIALIZED === this.state;
    }

    inPausableState() {
        return TimerState.RUNNING === this.state;
    }

    inStoppableState() {
        return TimerState.RUNNING === this.state;
    }

    inResumableState() {
        return TimerState.PAUSED === this.state;
    }

    start() {
        if (!this.inStartableState()) { return false; }

        let onTimeout = () => {
            this.stop();
            vscode.window.showInformationMessage("Pomodoro has expired. Enjoy your break!", "Restart")
                .then((value) => {
                    if ('Restart' === value)
                        vscode.commands.executeCommand(commands.START_TIMER_CMD);
                });
        };

        let onSecondElapsed = () => { this.formatStatusBar(); };

        console.log(this.name + ' is starting');

        this.state = TimerState.RUNNING;
        this.endDate = new Date(Date.now().valueOf() + this.interval);
        this.timeout = setTimeout(onTimeout, this.interval);
        this.secondsLeft = setInterval(onSecondElapsed, 1000);
        this.statusBarItem.command = commands.STOP_TIMER_CMD;
        this.formatStatusBar();

        return true;
    }

    resume() {
        // TODO: implement
        if (!this.inResumableState()) { return false; }
        console.log(this.name + " is resuming");
        return true;
    }

    pause() {
        // TODO: implement
        if (!this.inPausableState()) { return false; }

        console.log(this.name + ' is pausing');

        this.state = TimerState.PAUSED;
        this.statusBarItem.command = commands.RESUME_TIMER_CMD;
        this.formatStatusBar();

        clearTimeout(this.timeout);
        clearInterval(this.secondsLeft);

        return true;
    }

    stop() {
        if (!this.inStoppableState()) { return false; }

        console.log(this.name + ' is stopping');

        clearTimeout(this.timeout);
        clearInterval(this.secondsLeft);

        this.state = TimerState.FINISHED;
        this.timeout = 0;
        this.secondsLeft = 0;
        this.statusBarItem.command = commands.START_TIMER_CMD;
        this.formatStatusBar();

        return true;
    }

    dispose() {
        if (this.statusBarItem) {
            this.statusBarItem.hide();
            this.statusBarItem.dispose();
            this.statusBarItem = null;
        }
        this.state = TimerState.DISPOSED;
    }
};
exports.PomodoroTimer = PomodoroTimer;