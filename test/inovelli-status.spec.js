var helper = require("node-red-node-test-helper");
var assert = require("assert");
var statusNode = require("../inovelli-status");
 
helper.init(require.resolve('node-red'));
 
describe('inovelli-status node', function () {
 
  beforeEach(function (done) {
      helper.startServer(done);
  });
 
  afterEach(function (done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });
 
  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "inovelli-status-manager", name: "inovelli-status-manager" }];
    helper.load(statusNode, flow, function () {
      var n1 = helper.getNode("n1");
      assert.equal(n1.name, "inovelli-status-manager");
      done();
    });
  });
 
  it('should always send parameter of 8 and size of 4', function (done) {
    var flow = [
      { id: "n1", type: "inovelli-status-manager", name: "inovelli-status-manager", wires:[["n2"]] },
      { id: "n2", type: "helper" }
    ];
    helper.load(statusNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        assert.equal(msg.payload.data && msg.payload.data.parameter, 8);
        assert.equal(msg.payload.data && msg.payload.data.size, 4);
        done();
      });    
      n1.receive({ payload: {} });
    });
  });

  it('should allow setting of all the status properties from the receiving payload', function (done) {
    var flow = [
      { id: "n1", type: "inovelli-status-manager", name: "inovelli-status-manager", wires:[["n2"]] },
      { id: "n2", type: "helper" }
    ];
    helper.load(statusNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        assert.equal(msg.payload.data.node_id, 20);
        done();
      });    
      n1.receive({ 
        payload: {
          nodeId: 20,
          color: 1,
          duration: 10,
          display: 1,
          level: 10,
          switchtype: 8
        }
      });
    });
  });
});