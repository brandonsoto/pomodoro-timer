const assert = require('assert');
const vscode = require('vscode');
const p = require('../pomodoro');
const cmd = require('../commands');

let timer = new p.PomodoroTimer(1);

Set.prototype.difference = function(setB) {
    var difference = new Set(this);
    for (var elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

const NON_STARTABLE_STATES = p.ALL_STATES.difference(p.STARTABLE_STATES);
const NON_STOPPABLE_STATES = p.ALL_STATES.difference(p.STOPPABLE_STATES);
const NON_PAUSEABLE_STATES = p.ALL_STATES.difference(p.PAUSEABLE_STATES);
const NON_RESUMEABLE_STATES = p.ALL_STATES.difference(p.RESUMEABLE_STATES);

suite("Extension Tests", function() {
    test("Timer_Constructor", function () {
        assert.equal(timer.name, "Pomodoro");
        assert.equal(timer.interval, 1);
        assert.equal(timer.timeRemaining, 1);
        assert.equal(timer.timeout, 0);
        assert.equal(timer.secondInterval, 0);
        assert.equal(timer.statusBarItem.text, "$(triangle-right) 1 (initialized)");
        assert.equal(timer.statusBarItem.color, undefined);
        assert.equal(timer.state, p.TimerState.INITIALIZED);
    });

    test("Timer_IsStartable_WithStartableStates", function () {
        p.STARTABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isStartable(), true);
        });
    });

    test("Timer_IsStartable_WithNonStartableStates", function () {
        NON_STARTABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isStartable(), false);
        });
    });

    test("Timer_IsPauseable_WithPausableStates", function () {
        p.PAUSEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isPauseable(), true);
        });
    });

    test("Timer_IsPauseable_WithNonPausableStates", function () {
        NON_PAUSEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isPauseable(), false);
        });
    });

    test("Timer_IsStoppable_WithStoppableStates", function () {
        p.STOPPABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isStoppable(), true);
        });
    });

    test("Timer_IsStoppable_WithNonStoppableStates", function () {
        NON_STOPPABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isStoppable(), false);
        });
    });

    test("Timer_IsResumable_WithResumableStates", function () {
        p.RESUMEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isResumable(), true);
        });
    });

    test("Timer_IsResumable_WithNonResumableState", function () {
        NON_RESUMEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.isResumable(), false);
        });
    });

    test("Timer_setState", function () {
        timer = new p.PomodoroTimer(0);

        const state = p.TimerState.RUNNING;
        const command = cmd.START_TIMER_CMD;

        timer.setState(state, command);
        assert.equal(timer.state, state);
        assert.equal(timer.statusBarItem.command, command);
        assert.equal(timer.statusBarItem.text, "$(primitive-square) 0 (running)");
    });

    test("Timer_Start_WithStartableState", function () {
        timer = new p.PomodoroTimer(0);

        p.STARTABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.start(), true);
            assert.equal(timer.state, p.TimerState.RUNNING);
            assert.equal(timer.statusBarItem.command, cmd.PAUSE_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(primitive-square) 0 (running)");
        });
    });

    test("Timer_Start_WithNonStartableState", function () {
        timer = new p.PomodoroTimer(0);

        NON_STARTABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.start(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        });
    });

    test("Timer_Pause_WithPauseableState", function () {
        timer = new p.PomodoroTimer(0);

        p.PAUSEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.pause(), true);
            assert.equal(timer.state, p.TimerState.PAUSED);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (paused)");
        });
    });

    test("Timer_Pause_WithNonPauseableState", function () {
        timer = new p.PomodoroTimer(0);

        NON_PAUSEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.pause(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        });
    });

    test("Timer_Stop_WithStoppableState", function () {
        timer = new p.PomodoroTimer(0);

        p.STOPPABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.stop(), true);
            assert.equal(timer.state, p.TimerState.STOPPED);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (stopped)");
        });
    });

    test("Timer_Stop_WithNonStoppableState", function () {
        timer = new p.PomodoroTimer(0);

        NON_STOPPABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.stop(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        });
    });

    test("Timer_Dispose_WhenNotNull", function () {
        assert.doesNotThrow(() => { timer.dispose(); });
        assert.equal(timer.statusBarItem, null);
        assert.equal(timer.state, p.TimerState.DISPOSED);
    });

    test("Timer_Dispose_WhenNull", function () {
        timer.statusBarItem = null;
        assert.doesNotThrow(() => { timer.dispose(); });
        assert.equal(timer.statusBarItem, null);
        assert.equal(timer.state, p.TimerState.DISPOSED);
    });
});