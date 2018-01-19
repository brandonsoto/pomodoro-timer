/* global suite, test */

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const pom = require('../pomodoro');
const cmd = require('../commands');

let timer = new pom.PomodoroTimer(1);
const startableStates = [pom.TimerState.STOPPED, pom.TimerState.INITIALIZED, pom.TimerState.PAUSED];
const nonStartableStates = [pom.TimerState.UNKNOWN, pom.TimerState.RUNNING, pom.TimerState.DISPOSED];
const pauseableStates = [pom.TimerState.RUNNING];
const nonPauseableStates = [pom.TimerState.UNKNOWN, pom.TimerState.INITIALIZED, pom.TimerState.PAUSED, pom.TimerState.STOPPED, pom.TimerState.DISPOSED];
const stoppableStates = [pom.TimerState.RUNNING, pom.TimerState.PAUSED];
const nonStoppableStates = [pom.TimerState.UNKNOWN, pom.TimerState.INITIALIZED, pom.TimerState.STOPPED, pom.TimerState.DISPOSED];
const resumableStates = [pom.TimerState.PAUSED];
const nonResumableStates = [pom.TimerState.UNKNOWN, pom.TimerState.INITIALIZED, pom.TimerState.RUNNING, pom.TimerState.STOPPED, pom.TimerState.DISPOSED];

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {
    test("Timer_Constructor", function () {
        assert.equal(timer.name, "Pomodoro");
        assert.equal(timer.interval, 1);
        assert.equal(timer.timeRemaining, 1);
        assert.equal(timer.timeout, 0);
        assert.equal(timer.secondInterval, 0);
        assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        assert.equal(timer.statusBarItem.color, undefined);
        assert.equal(timer.state, pom.TimerState.INITIALIZED);
    });

    test("Timer_InStartableStateWithStartableStates", function () {
        startableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inStartableState(), true);
        });
    });

    test("Timer_InStartableStateWithNonStartableStates", function () {
        nonStartableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inStartableState(), false);
        });
    });

    test("Timer_InPauseableStateWithPausableStates", function () {
        pauseableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inPausableState(), true);
        });
    });

    test("Timer_InPauseableStateWithNonPausableStates", function () {
        nonPauseableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inPausableState(), false);
        });
    });

    test("Timer_InStoppableStateWithStoppableStates", function () {
        stoppableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inStoppableState(), true);
        });
    });

    test("Timer_InStoppableStateWithNonStoppableStates", function () {
        nonStoppableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inStoppableState(), false);
        });
    });

    test("Timer_InResumableStateWithResumableStates", function () {
        resumableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inResumableState(), true);
        });
    });

    test("Timer_InResumableStateWithNonResumableState", function () {
        nonResumableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.inResumableState(), false);
        });
    });

    test("Timer_setState", function () {
        timer = new pom.PomodoroTimer(0);

        const state = pom.TimerState.RUNNING;
        const command = cmd.START_TIMER_CMD;

        timer.setState(state, command);
        assert.equal(timer.state, state);
        assert.equal(timer.statusBarItem.command, command);
        assert.equal(timer.statusBarItem.text, "$(primitive-square) 0 (running)");
    });

    test("Timer_StartInStartableState", function () {
        timer = new pom.PomodoroTimer(0);

        startableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.start(), true);
            assert.equal(timer.state, pom.TimerState.RUNNING);
            assert.equal(timer.statusBarItem.command, cmd.PAUSE_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(primitive-square) 0 (running)");
        });
    });

    test("Timer_StartInNonStartableState", function () {
        timer = new pom.PomodoroTimer(0);

        nonStartableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.start(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        });
    });

    test("Timer_PauseInPauseableState", function () {
        timer = new pom.PomodoroTimer(0);

        pauseableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.pause(), true);
            assert.equal(timer.state, pom.TimerState.PAUSED);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (paused)");
        });
    });

    test("Timer_PauseInNonPauseableState", function () {
        timer = new pom.PomodoroTimer(0);

        nonPauseableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.pause(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        });
    });

    test("Timer_StopInStoppableState", function () {
        timer = new pom.PomodoroTimer(0);

        stoppableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.stop(), true);
            assert.equal(timer.state, pom.TimerState.STOPPED);
            assert.equal(timer.statusBarItem.command, cmd.START_TIMER_CMD);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (stopped)");
        });
    });

    test("Timer_StopInNonStoppableState", function () {
        timer = new pom.PomodoroTimer(0);

        nonStoppableStates.forEach((state) => {
            timer.state = state;
            assert.equal(timer.stop(), false);
            assert.equal(timer.state, state);
            assert.equal(timer.statusBarItem.command, undefined);
            assert.equal(timer.statusBarItem.text, "$(triangle-right) 0 (initialized)");
        });
    });

    test("Timer_DisposeWhenNotNull", function () {
        assert.doesNotThrow(() => { timer.dispose(); });
        assert.equal(timer.statusBarItem, null);
        assert.equal(timer.state, pom.TimerState.DISPOSED);
    });

    test("Timer_DisposeWhenNull", function () {
        timer.statusBarItem = null;
        assert.doesNotThrow(() => { timer.dispose(); });
        assert.equal(timer.statusBarItem, null);
        assert.equal(timer.state, pom.TimerState.DISPOSED);
    });
});