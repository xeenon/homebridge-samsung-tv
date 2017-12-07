const SamsungRemote = require('samsung-remote');
let Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-samsungtv", "Samsung-TV", SamsungTvAccessory);
};

function SamsungTvAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.ip_address = config["ip_address"];
    this.polling = config["polling"] | true;
    this.pollingInterval = config["pollingInterval"] | 1;

    if (!this.ip_address) throw new Error("You must provide an ip_address");

    this.remote = new SamsungRemote({
        ip: this.ip_address
    });

    this.service = new Service.Switch(this.name);

    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getState.bind(this))
        .on('set', this.setState.bind(this));

    this.isOn;
    this.timer;

    this.updateTimer();
}

SamsungTvAccessory.prototype = {
    getInformationService() {
        return new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'Samsung TV')
            .setCharacteristic(Characteristic.Model, '1.0.0')
            .setCharacteristic(Characteristic.SerialNumber, this.ip_address);
    },

    getServices() {
        return [this.service, this.getInformationService()];
    },

    getState(callback) {
        this.remote.isAlive(function (err) {
            if (err) {
                this.log.debug('TV offline: %s', err);
                callback(null, false);
            } else {
                this.log.debug('TV on');
                callback(null, true);
            }
        }.bind(this));
    },

    setState(on, callback) {
	if (on !== this.isOn) {
		let command = on ? 'KEY_POWERON' : 'KEY_POWEROFF';

		this.remote.send(command, function (err) {
	            if (err) {
        	        this.log('Failed sending %s', command, err);
	                callback(err);
        	    } else {
	                this.log(on ? 'Turned on' : 'Turned off');
                	callback(null);
        	    }
	        }.bind(this));
	}else {
		callback(null);
	}
    },

    updateTimer() {
        if (this.polling) {
            clearTimeout(this.timer);

            this.timer = setTimeout(function () {
                this.getState(function (err, state) {
                    if (err == null && state != this.isOn) {
                        this.log("State changed: %s", state ? "on" : "off");
                        this.service.getCharacteristic(Characteristic.On).updateValue(state);
                        this.isOn = state;
                    }
                }.bind(this));

                this.updateTimer();
            }.bind(this), this.pollingInterval * 1000);
        }
    }
};
