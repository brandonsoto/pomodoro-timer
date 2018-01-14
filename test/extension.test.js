/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const pomodoro = require('../pomodoro');

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {
    test("TimerConstructor", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        assert.equal(timer.name, "Pomodoro");
        assert.equal(timer.interval, 1);
        assert.equal(timer.icon, "$(clock)");
        assert.equal(timer.timeout, null);
        assert.equal(timer.statusBarItem.text, "");
        assert.equal(timer.statusBarItem.color, undefined);
    });

    test("TimerSetStatusText", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        const text = timer.icon + " " + timer.name + " test";
        const color = "red";

        assert.notEqual(timer.statusBarItem.text, text);
        assert.notEqual(timer.statusBarItem.color, color);

        timer.setStatusText("test", color);

        assert.equal(timer.statusBarItem.text, text);
        assert.equal(timer.statusBarItem.color, color);
    });


    test("TimerStartWithNoTimeout", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        assert.equal(timer.start(), true);
    });

    test("TimerStartWithTimeout", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        timer.timeout = 50;
        assert.equal(timer.start(), false);
    });

    test("TimerStopWithNoTimeout", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        assert.equal(timer.timeout, null);
        assert.equal(timer.stop(), false);
    });

    test("TimerStopWithTimeout", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        timer.timeout = 50;
        assert.equal(timer.timeout, 50);
        assert.equal(timer.stop(), true);
    });

    test("TimerDisposeNotNull", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        assert.doesNotThrow(() => { timer.dispose(); });
        assert.equal(timer.statusBarItem, null);
    });

    test("TimerDisposeNull", function () {
        const timer = new pomodoro.PomodoroTimer(1);
        timer.statusBarItem = null;
        assert.doesNotThrow(() => { timer.dispose(); });
        assert.equal(timer.statusBarItem, null);
    });
});