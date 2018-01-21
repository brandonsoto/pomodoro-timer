const assert = require('assert');
const vscode = require('vscode');
const p = require('../pomodoro');
const cmd = require('../commands');

let timer = new p.PomodoroTimer(0);

Set.prototype.difference = function(setB) {
    let difference = new Set(this);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

const NON_STARTABLE_STATES = p.ALL_STATES.difference(p.STARTABLE_STATES);
const NON_STOPPABLE_STATES = p.ALL_STATES.difference(p.STOPPABLE_STATES);
const NON_PAUSEABLE_STATES = p.ALL_STATES.difference(p.PAUSEABLE_STATES);

suite("Extension Tests", function() {
    test("Timer_Constructor", function () {
        assert.equal(timer.name, "Pomodoro");
        assert.equal(timer.interval, 0);
        assert.equal(timer.millisecondsRemaining, 0);
        assert.equal(timer.timeout, 0);
        assert.equal(timer.secondInterval, 0);
        assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (ready)");
        assert.equal(timer.statusBarItem.color, undefined);
        assert.equal(timer.state, p.TimerState.READY);
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

    test("Timer_setState", function () {
        const state = p.TimerState.RUNNING;
        const command = cmd.START_TIMER_CMD;

        timer.setState(state, command);
        assert.equal(timer.state, state);
        assert.equal(timer.statusBarItem.command, command);
        assert.equal(timer.statusBarItem.text, "$(primitive-square) 00:00 (running)");
    });

    test("Timer_Start_WithStartableState", function () {
        timer = new p.PomodoroTimer(0);

        p.STARTABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.start(), true);
            assert.equal(timer.state, p.TimerState.RUNNING);
            assert.equal(timer.statusBarItem.command, cmd.PAUSE_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(primitive-square) 00:00 (running)");
        });
    });

    test("Timer_Start_WithNonStartableState", function () {
        timer = new p.PomodoroTimer(0);

        NON_STARTABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.start(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (ready)");
        });
    });

    test("Timer_Pause_WithPauseableState", function () {
        timer = new p.PomodoroTimer(0);

        p.PAUSEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.pause(), true);
            assert.equal(timer.state, p.TimerState.PAUSED);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (paused)");
        });
    });

    test("Timer_Pause_WithNonPauseableState", function () {
        timer = new p.PomodoroTimer(0);

        NON_PAUSEABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.pause(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (ready)");
        });
    });

    test("Timer_Stop_WithStoppableState", function () {
        timer = new p.PomodoroTimer(0);

        p.STOPPABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.stop(), true);
            assert.equal(timer.state, p.TimerState.FINISHED);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (finished)");
        });
    });

    test("Timer_Stop_WithNonStoppableState", function () {
        timer = new p.PomodoroTimer(0);

        NON_STOPPABLE_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.stop(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (ready)");
        });
    });

    test("Timer_Reset", function () {
        timer = new p.PomodoroTimer(0);

        p.ALL_STATES.forEach((state) => {
            timer.state = state;
            assert.equal(timer.reset(), true);
            assert.equal(timer.state, p.TimerState.READY);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 00:00 (ready)");
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