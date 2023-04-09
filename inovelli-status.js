const ZigbeeSwitches = ["VZM31-SN"];
const ZwaveSwitches = [8, 16, "8", "16", "LZW31-SN", "LZW30-SN"];

module.exports = function (RED) {
  function InovelliStatusManager(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const { color, level, duration, display, switchtype } = config;

    this.color = parseInt(color, 10);
    this.level = parseInt(level, 10);
    this.duration = duration;
    this.display = display;
    this.switchtype = switchtype;

    node.on("input", (msg) => {
      const {
        color: presetColor,
        level: presetLevel,
        duration: presetDuration,
        display: presetDisplay,
        switchtype: presetSwitchtype,
      } = node;
      const { payload } = msg;

      const parsedSwitchType = payload.switchtype || presetSwitchtype;

      if (ZwaveSwitches.includes(parsedSwitchType)) {
        const color = payload.color || presetColor;
        const level = (payload.level || presetLevel) * 255;
        const parsedDuration = payload.duration || presetDuration;
        const duration = (parsedDuration > 255 ? 255 : parsedDuration) * 65536;
        const display =
          (payload.display || parseInt(presetDisplay, 10)) * 16777216;
        const value = color + level + duration + display;
        const node_id = payload.nodeId ? { node_id: payload.nodeId } : {};
        let parameter;

        if ([16, 8].includes(parseInt(parsedSwitchType, 10))) {
          parameter = parseInt(parsedSwitchType, 10);
        }

        if (parsedSwitchType === "LZW30-SN") {
          parameter = 8;
        }

        if (parsedSwitchType === "LZW31-SN") {
          parameter = 16;
        }

        data = {
          ...node_id,
          parameter,
          value,
        };

        node.send({
          ...msg,
          payload: { data },
        });
      } else if (ZigbeeSwitches.includes(parsedSwitchType)) {
        const parsedDuration = payload.duration || presetDuration;

        // duration (numeric): 1-60 is in seconds calculated 61-120 is in minutes calculated by(value-60) Example a value of 65 would be 65-60 = 5 minutes - 120-254 Is in hours calculated by(value-120) Example a value of 132 would be 132-120 would be 12 hours. - 255 Indefinitely max value is 255
        let mappedDuration = 255;

        if (parsedDuration <= 60) {
          mappedDuration = parsedDuration;
        } else if (parsedDuration <= 3600) {
          mappedDuration = Math.round(parsedDuration / 60 + 60);
        } else if (parsedDuration <= 216000) {
          mappedDuration = Math.round(parsedDuration / 3600 + 120);
        }

        data = {
          led_effect: {
            effect: payload.display || presetDisplay,
            color: payload.color || presetColor,
            level: payload.level || presetLevel * 10,
            duration: mappedDuration,
          },
        };

        node.send({
          ...msg,
          payload: data,
        });
      }

      node.status({ text: `Sent color: ${color}` });
    });
  }
  RED.nodes.registerType("inovelli-status-manager", InovelliStatusManager);
};
