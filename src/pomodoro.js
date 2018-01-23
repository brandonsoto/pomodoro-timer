const vscode = require('vscode');
const commands = require('./commands');
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const DEFAULT_TIMER_DURATION = 1500000; // 25 minutes in milliseconds

// TODO: might want to put state data/logic into its own class
var TimerState = {
    UNKNOWN: 0,
    READY: 1,
    RUNNING: 2,
    PAUSED: 3,
    FINISHED: 4,
    DISPOSED: 5
}
exports.TimerState = TimerState;

const STARTABLE_STATES = new Set([TimerState.FINISHED, TimerState.READY, TimerState.PAUSED]);
exports.STARTABLE_STATES = STARTABLE_STATES;

const STOPPABLE_STATES = new Set([TimerState.RUNNING, TimerState.PAUSED]);
exports.STOPPABLE_STATES = STOPPABLE_STATES;

const PAUSEABLE_STATES = new Set([TimerState.RUNNING]);
exports.PAUSEABLE_STATES = PAUSEABLE_STATES;

const ALL_STATES = new Set([TimerState.UNKNOWN, TimerState.READY, TimerState.RUNNING, TimerState.PAUSED, TimerState.FINISHED, TimerState.DISPOSED]);
exports.ALL_STATES = ALL_STATES;

function stateToString(state) {
    switch(state) {
        case TimerState.UNKNOWN:
            return "unknown";
        case TimerState.READY:
            return "ready";
        case TimerState.RUNNING:
            return "running";
        case TimerState.PAUSED:
            return "paused";
        case TimerState.FINISHED:
            return "finished";
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
    constructor(interval=DEFAULT_TIMER_DURATION) {
        this.name = "Pomodoro";
        this.interval = interval === DEFAULT_TIMER_DURATION ? vscode.workspace.getConfiguration("pomodoro").get("interval", DEFAULT_TIMER_DURATION) * MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE : interval;
        this.millisecondsRemaining = this.interval;
        this.timeout = 0;
        this.endDate = new Date();
        this.secondInterval = 0;
        this.state = TimerState.READY;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_SAFE_INTEGER);
        this.statusBarItem.command = commands.START_TIMER_CMD;
        this.statusBarItem.show();
        this.updateStatusBar();
    }

    updateStatusBar() {
        const icon = TimerState.RUNNING === this.state ? "$(primitive-square)" : "$(triangle-right)";
        this.statusBarItem.text = icon + " " + millisecondsToMMSS(this.millisecondsRemaining) + " (" + stateToString(this.state) + ")";
    }

    setState(state, statusBarCommand) {
        this.state = state;
        this.statusBarItem.command = statusBarCommand;
        this.updateStatusBar();
    }

    isStartable() { return STARTABLE_STATES.has(this.state); }

    isPauseable() { return PAUSEABLE_STATES.has(this.state); }

    isStoppable() { return STOPPABLE_STATES.has(this.state); }

    // starts/resumes the timer but does not reset it
    start() {
        if (!this.isStartable()) { return false; }

        let onTimeout = () => {
            this.reset();
            vscode.window.showInformationMessage("Pomodoro has expired. Enjoy your break!", "Restart")
                .then((value) => {
                    if ('Restart' === value) {
                        this.reset();
                        this.start();
                    }
                });
        };

        let onSecondElapsed = () => { 
            this.millisecondsRemaining -= MILLISECONDS_IN_SECOND;
            this.updateStatusBar();
        };

        this.endDate = new Date(Date.now().valueOf() + this.millisecondsRemaining);
        this.timeout = setTimeout(onTimeout, this.millisecondsRemaining);
        this.secondInterval = setInterval(onSecondElapsed, MILLISECONDS_IN_SECOND);
        this.setState(TimerState.RUNNING, commands.PAUSE_TIMER_CMD);

        return true;
    }

    // pauses the timer but does not reset it
    pause() {
        if (!this.isPauseable()) { return false; }

        clearTimeout(this.timeout);
        clearInterval(this.secondInterval);

        this.setState(TimerState.PAUSED, commands.START_TIMER_CMD);

        return true;
    }

    // stops the timer completely
    stop() {
        if (!this.isStoppable()) { return false; }

        clearTimeout(this.timeout);
        clearInterval(this.secondInterval);

        this.timeout = 0;
        this.secondInterval = 0;
        this.millisecondsRemaining = 0;
        this.setState(TimerState.FINISHED, commands.START_TIMER_CMD);
        this.millisecondsRemaining = this.interval;

        return true;
    }

    // stops and resets the timer but does not start it
    reset() {
        this.stop();
        this.millisecondsRemaining = this.interval;
        this.setState(TimerState.READY, commands.START_TIMER_CMD);
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