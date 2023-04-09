## Inovelli Status Manager Node

This node allows you to easily set the appropriate value to send to your Inovelli red series switch.

### Z-wave (red) switches w/ zwave_js

This node should be used in conjunction with the `node-red–contrib-home-assistant` add on and the output
should be connected to a api-call-service node that is set to the domain `zwave_js` and the service `bulk_set_partial_config_parameters`.
You can set the entity ID to your z-wave switch. DO NOT set the Node ID on the status manager node as it isn't needed
when you set `bulk_set_partial_config_parameters` to point to an entity id.

### Quick start guide

There are example flows for red switches to zwave_js service call nodes and blue switches to either native mqtt out or home assistant `mqtt.publish` nodes

### Zigbee (blue) switches

There is currently support for constructing a MQTT payload for full LED control for Zigbee2MQTT users. (Individual control might be coming soon but will be trickier).
When using this node with home assistant it can be connected directly to an `api-call-service` node calling `mqtt` with the service `publish`.
You will want to set the topic to `zigbee2mqtt/FRIENDLY_NAME/set`.

#### Node-RED mqtt out node

You can wire the configration node directly to the mqtt out node. You just need to set the topic ``zigbee2mqtt/FRIENDLY_NAME/set`.

#### Home Assistant MQTT Publish node

The `mqtt.publish` service only supports string payloads so you have to stringify the output and pass it to the payload. There is an example
that does this using a function node but there are multiple ways to do this (e.g. )

### Contributing

If you notice any problems open an issue or a pull request. Thanks.
