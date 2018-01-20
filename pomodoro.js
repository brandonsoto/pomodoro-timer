const vscode = require('vscode');
const commands = require('./commands');
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;

// TODO: might want to put state data/logic into its own class
var TimerState = {
    UNKNOWN: 0,
    INITIALIZED: 1,
    RUNNING: 2,
    PAUSED: 3,
    STOPPED: 4,
    DISPOSED: 5
}
exports.TimerState = TimerState;

const STARTABLE_STATES = new Set([TimerState.RUNNING, TimerState.STOPPED, TimerState.INITIALIZED, TimerState.PAUSED]);
exports.STARTABLE_STATES = STARTABLE_STATES;

const STOPPABLE_STATES = new Set([TimerState.RUNNING, TimerState.PAUSED]);
exports.STOPPABLE_STATES = STOPPABLE_STATES;

const PAUSEABLE_STATES = new Set([TimerState.RUNNING]);
exports.PAUSEABLE_STATES = PAUSEABLE_STATES;

const RESUMEABLE_STATES = new Set([TimerState.PAUSED]);
exports.RESUMEABLE_STATES = RESUMEABLE_STATES;

const ALL_STATES = new Set([TimerState.UNKNOWN, TimerState.INITIALIZED, TimerState.RUNNING, TimerState.PAUSED, TimerState.STOPPED, TimerState.DISPOSED]);
exports.ALL_STATES = ALL_STATES;

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

function millisecondsToMMSS (milliseconds) {
    let totalSeconds = Math.round(milliseconds / MILLISECONDS_IN_SECOND);
    let minutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
    let seconds = Math.floor(totalSeconds - (minutes * SECONDS_IN_MINUTE));

    if (minutes < 10) {minutes = "0" + minutes; }
    if (seconds < 10) {seconds = "0" + seconds; }

    return minutes + ':' + seconds;
}

class PomodoroTimer {
    constructor(interval=5000) { // TODO: change default to 25 minutes for release
        this.name = "Pomodoro";
        this.interval = vscode.workspace.getConfiguration("pomodoro").get("interval", interval);
        this.millisecondsRemaining = this.interval;
        this.timeout = 0;
        this.endDate = new Date();
        this.secondInterval = 0;
        this.state = TimerState.INITIALIZED;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBarItem.show();
        this.formatStatusBar();
    }

    formatStatusBar() {
        const icon = TimerState.RUNNING === this.state ? "$(primitive-square)" : "$(triangle-right)";
        this.statusBarItem.text = icon + " " + millisecondsToMMSS(this.millisecondsRemaining) + " (" + stateToString(this.state) + ")";
    }

    setState(state, statusBarCommand) {
        this.state = state;
        this.statusBarItem.command = statusBarCommand;
        this.formatStatusBar();
    }

    isStartable() {
        return STARTABLE_STATES.has(this.state);
    }

    isPauseable() {
        return PAUSEABLE_STATES.has(this.state);
    }

    isStoppable() {
        return STOPPABLE_STATES.has(this.state);
    }

    isResumable() {
        return RESUMEABLE_STATES.has(this.state);
    }

    start() {
        if (!this.isStartable()) { return false; }
        if (this.state !== TimerState.PAUSED) { this.stop(); }

        let onTimeout = () => {
            this.stop();
            vscode.window.showInformationMessage("Pomodoro has expired. Enjoy your break!", "Restart")
                .then((value) => {
                    if ('Restart' === value) {
                        vscode.commands.executeCommand(commands.START_TIMER_CMD);
                    }
                });
        };

        let onSecondElapsed = () => { 
            this.millisecondsRemaining -= MILLISECONDS_IN_SECOND;
            this.formatStatusBar();
        };

        this.endDate = new Date(Date.now().valueOf() + this.millisecondsRemaining);
        this.timeout = setTimeout(onTimeout, this.millisecondsRemaining);
        this.secondInterval = setInterval(onSecondElapsed, MILLISECONDS_IN_SECOND);
        this.setState(TimerState.RUNNING, commands.PAUSE_TIMER_CMD);

        return true;
    }

    pause() {
        if (!this.isPauseable()) { return false; }

        clearTimeout(this.timeout);
        clearInterval(this.secondInterval);

        this.setState(TimerState.PAUSED, commands.START_TIMER_CMD);

        return true;
    }

    // TODO(brandon): should stop() be public? It's a tad confusing to have pause() and stop() together. Perhaps just restart()?
    stop() {
        if (!this.isStoppable()) { return false; }

        clearTimeout(this.timeout);
        clearInterval(this.secondInterval);

        this.timeout = 0;
        this.secondInterval = 0;
        this.millisecondsRemaining = 0;
        this.setState(TimerState.STOPPED, commands.START_TIMER_CMD);
        this.millisecondsRemaining = this.interval;

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
