#Homebridge-samsungtv

Samsung TV plugin for [Homebridge](https://github.com/nfarina/homebridge)

This plugin allows you to control your Samsung TV with HomeKit and Siri.

##Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-samsungtv-control`
3. Update your configuration file. See the sample below.

##Configuration
Example config.json:

```js
    "accessories": [
		{
			"accessory": "SamsungTV",
			"name": "TV Living room",
			"ip_address": "192.168.1.2",
            "send_delay": 400
		}
	],
```

###Explanation:

Field           | Description
----------------|------------
**accessory**   | Must always be "SamsungTV". (required)
**name**        | The name you want to use to control the TV.
**ip_address**  | The internal ip address of your samsung TV.
**send_delay**   | When switching to another channel the individual keys will be send with a short delay (in ms) between them. (default 400)

##Limitations:

Since some Samsung TV's will disconnect from the network when turned off it is not possible to turn them back on again over network.
Furthermore it is not possible to observe current values such as the volume or the channel. Therefore only channel changes that where made through this plugin will be tracked (channel changes with the regular remote for example can not be tracked).

When changing the volume characteristic the number represents the count of times the volume up or down key will be triggered. This means to increase the volume by 3 units the characteristic should be set to 3. To decrease the volume by 2 units e.g. the value would be -2. By setting volume to 0 the mute key will be triggered. 