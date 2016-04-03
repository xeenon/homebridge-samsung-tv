#Homebridge-samsungtv

Samsung TV plugin for [Homebridge](https://github.com/nfarina/homebridge)

This allows you to control your Samsung TV with HomeKit and Siri.

##Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-samsungtv`
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

If you are using the [Homekit Catalog App](https://developer.apple.com/library/ios/samplecode/HomeKitCatalog/Introduction/Intro.html) to setup scenes etc. it can be pretty tricky to adjust the channel value with the slider because the values range between 1 and 9999. I suggest to turn the iPhone into landscape mode when adjusting the channel value therefore because it allows a more precise value adaption.