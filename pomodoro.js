const vscode = require('vscode');
const commands = require('./commands');
const SECOND_IN_MILLISECONDS = 1000;

var TimerState = {
    UNKNOWN: 0,
    INITIALIZED: 1,
    RUNNING: 2,
    PAUSED: 3,
    STOPPED: 4,
    DISPOSED: 5
}
exports.TimerState = TimerState;

function stateToString(state) {
    switch(state) {
        case TimerState.UNKNOWN:
            return "unknown";
        case TimerState.INITIALIZED:
            return "initialized";
        case TimerState.RUNNING:
            return "running";
        case TimerState.PAUSED:
            return "paused";
        case TimerState.STOPPED:
            return "stopped";
        case TimerState.DISPOSED:
            return "disposed";
        default:
            return "unknown";
    }
}

class PomodoroTimer {
    constructor(interval=5000) { // TODO: change default to 25 minutes for release
        this.name = "Pomodoro";
        this.interval = vscode.workspace.getConfiguration("pomodoro").get("interval", interval);
        this.timeRemaining = this.interval;
        this.timeout = 0;
        this.endDate = new Date();
        this.secondInterval = 0;
        this.state = TimerState.INITIALIZED;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBarItem.show();
        this.formatStatusBar();
    }

    formatStatusBar() {
        const timeLeft = Math.ceil( (this.endDate.getTime() - Date.now().valueOf()) / SECOND_IN_MILLISECONDS ); // TODO: this should be formatted like 00:00
        const icon = TimerState.RUNNING === this.state ? "$(primitive-square)" : "$(triangle-right)";
        this.statusBarItem.text = icon + " " + timeLeft + " (" + stateToString(this.state) + ")";
    }

    setState(state, statusBarCommand) {
        this.state = state;
        this.statusBarItem.command = statusBarCommand;
        this.formatStatusBar();
    }

    isStartable() {
        return TimerState.STOPPED === this.state
            || TimerState.INITIALIZED === this.state
            || TimerState.PAUSED === this.state;
    }

    isPauseable() {
        return TimerState.RUNNING === this.state;
    }

    isStoppable() {
        return TimerState.RUNNING === this.state
            || TimerState.PAUSED === this.state;
    }

    isResumable() {
        return TimerState.PAUSED === this.state;
    }

    start() {
        if (!this.isStartable()) { return false; }

        let onTimeout = () => {
            this.stop();
            vscode.window.showInformationMessage("Pomodoro has expired. Enjoy your break!", "Restart")
                .then((value) => {
                    if ('Restart' === value)
                        vscode.commands.executeCommand(commands.START_TIMER_CMD);
                });
        };

        let onSecondElapsed = () => { 
            this.timeRemaining -= SECOND_IN_MILLISECONDS;
            this.formatStatusBar();
        };

        console.log(this.name + ' is starting');

        this.endDate = new Date(Date.now().valueOf() + this.timeRemaining);
        this.timeout = setTimeout(onTimeout, this.timeRemaining);
        this.secondInterval = setInterval(onSecondElapsed, SECOND_IN_MILLISECONDS);
        this.setState(TimerState.RUNNING, commands.PAUSE_TIMER_CMD);

        return true;
    }

    pause() {
        if (!this.isPauseable()) { return false; }

        console.log(this.name + ' is pausing');

        clearTimeout(this.timeout);
        clearInterval(this.secondInterval);

        this.setState(TimerState.PAUSED, commands.START_TIMER_CMD);

        return true;
    }

    // TODO(brandon): should stop() be public? It's a tad confusing to have pause() and stop() together. Perhaps just restart()?
    stop() {
        if (!this.isStoppable()) { return false; }

        console.log(this.name + ' is stopping');

        clearTimeout(this.timeout);
        clearInterval(this.secondInterval);

        this.timeout = 0;
        this.secondInterval = 0;
        this.timeRemaining = 0;
        this.setState(TimerState.STOPPED, commands.START_TIMER_CMD);
        this.timeRemaining = this.interval;

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