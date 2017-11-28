var inputEvent = require('input-event');
var fs = require('fs');
const BY_ID_PATH = '/dev/input/by-id/';
const KEYCODES = require('./keycodes');

var startReading = function(devIdPath, dataCallback) {
    console.log('Reading events from device: ' + devIdPath);
    var k = new inputEvent(devIdPath);
    // k.on('data', console.log);
    let buffer = [];
    k.on('data', ev => {
        if (ev.type === 1 && ev.value === 1) {
            const value = KEYCODES[ev.code];
            
            if (value === '\n') {
                const deviceId = buffer.join('');
                console.log('Device regsitered: ' + deviceId);
                if (dataCallback) {
                    dataCallback(deviceId);
                }
                buffer = [];
            }
            else {
                buffer.push(value);
            }
        }
        
    });

}

var readBadgets = function(callback) {
    fs.readdir(BY_ID_PATH, (err, files) => {
        if (err) {
            console.warn(err);
            process.exit(1);
        }
    
        var targetDevice;
    
        files.forEach(f => {
            if (f.indexOf('RFID') >= 0) {
                console.log('Found device: ' + f);
                targetDevice = f;
            }
        });
    
        if (targetDevice) {
            fs.realpath(BY_ID_PATH + targetDevice, (err, resolved) => {
                if (err) {
                    console.warn(err);
                    process.exit(1);
                }
    
                startReading(resolved, callback);
            });
            
        }
        else {
            console.warn('Could not find device!');
        }
    });
}

module.exports = {
    readBadgets: readBadgets
}