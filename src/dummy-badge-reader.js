const badgeIds = ['3234342237', '1231232136', '3234542237'];

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
            if (i > 10) {
                i = 0;
            }
            callback(val);
            next();
        }, 10000);
    };

    next();
};

module.exports = {
    readBadges: readBadges
};
