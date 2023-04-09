var helper = require("node-red-node-test-helper");
var should = require("should");
var statusNode = require("../inovelli-status");

helper.init(require.resolve("node-red"));

describe("inovelli-status node", function () {
  beforeEach(function (done) {
    helper.startServer(done);
  });

  afterEach(function (done) {
    helper.unload();
    helper.stopServer(done);
  });

  it("should be loaded", function (done) {
    var flow = [
      {
        id: "n1",
        type: "inovelli-status-manager",
        name: "inovelli-status-manager",
      },
    ];
    helper.load(statusNode, flow, function () {
      const n1 = helper.getNode("n1");

      try {
        n1.should.have.property("name", "inovelli-status-manager");
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should omit node_id if not configured and send the correct parameter with a value", function (done) {
    var flow = [
      {
        id: "n1",
        type: "inovelli-status-manager",
        name: "inovelli-status-manager",
        color: 0,
        level: 10,
        duration: 30,
        display: 1,
        switchtype: 8,
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(statusNode, flow, function () {
      const n2 = helper.getNode("n2");
      const n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        try {
          msg.payload.data.should.not.have.property("node_id");
          msg.payload.data.should.have.property("parameter", 8);
          msg.payload.data.should.have.property("value").which.is.a.Number();
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({ payload: {} });
    });
  });

  it("should cap the duration at 255 for zwave switches", function (done) {
    var flow = [
      {
        id: "n1",
        type: "inovelli-status-manager",
        name: "inovelli-status-manager",
        color: 0,
        level: 0,
        duration: 266,
        display: 0,
        switchtype: "LZW30-SN",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(statusNode, flow, function () {
      const n2 = helper.getNode("n2");
      const n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        try {
          msg.payload.data.should.have.property("value", 255 * 65536);
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({ payload: {} });
    });
  });

  it("should send a MQTT style payload for zigbee switches", function (done) {
    var flow = [
      {
        id: "n1",
        type: "inovelli-status-manager",
        name: "inovelli-status-manager",
        color: 82,
        level: 10,
        duration: 266,
        display: "fast_rising",
        switchtype: "VZM31-SN",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(statusNode, flow, function () {
      const n2 = helper.getNode("n2");
      const n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        try {
          msg.payload.should.have.property("led_effect");
          msg.payload.led_effect.should.have.property("effect", "fast_rising");
          msg.payload.led_effect.should.have.property("color", 82);
          msg.payload.led_effect.should.have.property("level", 100);
          msg.payload.led_effect.should.have.property("duration", 64);
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({ payload: {} });
    });
  });

  it("should set duration to 255 for zigbee switches that pass over 482401 seconds", function (done) {
    var flow = [
      {
        id: "n1",
        type: "inovelli-status-manager",
        name: "inovelli-status-manager",
        color: 82,
        level: 10,
        duration: 482402,
        display: "small_to_big",
        switchtype: "VZM31-SN",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(statusNode, flow, function () {
      const n2 = helper.getNode("n2");
      const n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        try {
          msg.payload.led_effect.should.have.property("duration", 255);
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({ payload: {} });
    });
  });

  it("should allow setting of all the status properties from the receiving payload", function (done) {
    var flow = [
      {
        id: "n1",
        type: "inovelli-status-manager",
        name: "inovelli-status-manager",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(statusNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        try {
          msg.payload.data.should.have.property("node_id", 20);
          msg.payload.data.should.have.property("parameter", 16);
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({
        payload: {
          nodeId: 20,
          color: 1,
          duration: 10,
          display: 1,
          level: 10,
          switchtype: 16,
        },
      });
    });
  });
});
