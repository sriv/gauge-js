var assert = require("chai").assert,
    nodevm = require("vm"),
    sinon = require("sinon"),
    fs = require("fs"),
    VM = require("../src/vm");

global.gauge = require("../src/gauge-global");

describe("VM", function () {

  var sandbox;

  before( function () {
    sandbox = sinon.sandbox.create();

    sandbox.stub( fs, "readFileSync", function () {
      return "var x = 'oh, my!';";
    });
  });

  after( function () {
    sandbox.restore();
  });

  it("should instantiate with sane defaults", function (done) {
    sinon.spy(nodevm, "createContext");
    var vm = new VM();
    vm.contextify();

    assert(nodevm.createContext.calledOnce);
    assert.isDefined(vm.context);
    assert.deepEqual(vm.options, { dirname: ".", filename: "test.js", filepath: "./test.js", displayErrors: true, timeout: 1000,
                                   root: process.env.PWD });

    nodevm.createContext.restore();
    done();
  });

  it("should expose global.gauge", function () {
    var vm = new VM();
    vm.contextify();
    assert.doesNotThrow(function () { vm.run("var ohai = gauge.step"); });
  });

  it("should expose require", function () {
    var vm = new VM();
    vm.contextify();
    assert.doesNotThrow(function () { vm.run("var fs = require('fs')"); });
  });

  it("should expose console", function () {
    var vm = new VM();
    vm.contextify();
    assert.doesNotThrow(function () { vm.run("var log = console.log"); });
  });

  it("should expose process.env", function () {
    var vm = new VM();
    vm.contextify();
    assert.doesNotThrow(function () { vm.run("var GAUGE_PROJECT_ROOT = process.env.GAUGE_PROJECT_ROOT"); });
  });

  it("should not read from file and run code", function () {
    var vm = new VM();
    vm.contextify();
    assert.doesNotThrow(function () { vm.runFile("mytest_implementation.js"); });
    assert.equal(vm.options.filename, "mytest_implementation.js");
  });

});
