const samsungAPI = require('./lib/samsungAPI').SamsungAPI;
let Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-samsung-tv", "samsungTv", SamsungTvAccessory);
};

function SamsungTvAccessory(log, config) {
    this.log = log;
    this.name = config.name;
    this.ipAddress = config.ip_address;
    this.macAddress = config.macAddress;
    this.polling = config.polling | true;
    this.pollingInterval = config.pollingInterval | 1;
    this.isOn;

    this.api = new samsungAPI(this.log, this.ipAddress, this.macAddress);

    this.services = [];

    this.tvService = new Service.Television(this.name, 'Television')
        .setCharacteristic(Characteristic.ConfiguredName, this.name)
        .setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.NOT_DISCOVERABLE)
        .setCharacteristic(Characteristic.PowerModeSelection, Characteristic.PowerModeSelection.SHOW);

    this.tvService
        .getCharacteristic(Characteristic.Active)
        .on('set', this.setPowerState.bind(this))
        .on('get', this.getPowerState.bind(this));

    this.tvService.setCharacteristic(Characteristic.ActiveIdentifier, 1);

    this.tvService
        .getCharacteristic(Characteristic.ActiveIdentifier)
        .on('set', this.setInput.bind(this));

    this.tvService
        .getCharacteristic(Characteristic.RemoteKey)
        .on('set', this.sendRemoteKey.bind(this));

    this.speakerService = new Service.TelevisionSpeaker(this.name + ' volume', 'volumeService')
        .setCharacteristic(Characteristic.Active, Characteristic.Active.ACTIVE)
        .setCharacteristic(Characteristic.VolumeControlType, Characteristic.VolumeControlType.ABSOLUTE);

    this.speakerService
        .getCharacteristic(Characteristic.VolumeSelector)
        .on('set', this.setVolume.bind(this));

    this.speakerService
        .getCharacteristic(Characteristic.Mute)
        .on('set', this.setMute.bind(this));

    let index = 1;

    this.tvInputService = new Service.InputSource('TV', 'TV')
        .setCharacteristic(Characteristic.Identifier, index++)
        .setCharacteristic(Characteristic.ConfiguredName, 'TV')
        .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN)
        .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.TUNER)
        .setCharacteristic(Characteristic.InputDeviceType, Characteristic.InputDeviceType.TV);

    this.tvService.addLinkedService(this.speakerService);
    this.tvService.addLinkedService(this.tvInputService);

    this.services.push(this.tvService, this.speakerService, this.tvInputService);

    this.inputServices = {
        1: this.tvInputService
    };

    config.enabledInputs
        .forEach(inputId => {
            let serviceIndex = index++;
            let inputService = this.createInputService(serviceIndex, inputId);
            this.tvService.addLinkedService(inputService);
            this.services.push(inputService);
            this.inputServices[serviceIndex] = inputService;
        });

    this.timer;
    this.updateTimer();
}

SamsungTvAccessory.prototype = {
    getServices() {
        return this.services;
    },

    setPowerState(state, callback) {
        this.log.debug('State received:', state);
        this.api.setState(state, callback);
    },

    getPowerState(callback) {
        this.log.debug('Get state called');
        this.api.isOn(callback);
    },

    sendRemoteKey(key, callback) {
        this.log.debug('Key received:', key);
        this.api.sendKey(key, callback);
    },

    setVolume(volume, callback) {
        this.log.debug('Volume received:', volume);
        this.api.changeVolume(volume,callback);
    },

    setMute(mute, callback) {
        this.log.debug('Mute received:', mute);
        this.api.setMute(callback);
    },

    setInput(input, callback) {
        this.log.debug('Input received:', input);
        this.api.setInput(input, callback);
    },

    updateTimer() {
        if (this.polling) {
            clearTimeout(this.timer);

            this.timer = setTimeout(function () {
                this.getPowerState(function (err, isOn) {
                    if (err == null && isOn !== this.isOn) {
                        this.log("State changed: %s", isOn ? "on" : "off");
                        this.isOn = isOn;
                        this.tvService.getCharacteristic(Characteristic.Active).updateValue(isOn);
                    }
                }.bind(this));

                this.updateTimer();
            }.bind(this), this.pollingInterval * 1000);
        }
    },

    createInputService(index, id) {
        this.log.debug('Creating %s with id %s', id, index);

        return new Service.InputSource(id, id)
            .setCharacteristic(Characteristic.Identifier, index)
            .setCharacteristic(Characteristic.ConfiguredName, id)
            .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.NOT_CONFIGURED)
            .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI)
            .setCharacteristic(Characteristic.InputDeviceType, Characteristic.InputDeviceType.OTHER);
    }
};
