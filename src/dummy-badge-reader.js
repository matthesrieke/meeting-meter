const badgeIds = ['0355757047', '0000517857', '0000803221'];

/**
 * searches for the RFID devices and starts listening to input events
 * 
 * @param {*} callback cb function that is called with a device id string for each Badge read
 */
var readBadges = function (callback) {
    let i = 0;

    const next = () => {
        setTimeout(() => {
            const val = i <= 2 ? badgeIds[i] : 'bla';
            i++;
            if (i <= 10) {
                next();
            }
            callback(val);
        }, 5000);
    };

    next();
};

module.exports = {
    readBadges: readBadges
};
