import * as moment from 'moment';
import { Moment } from 'moment'

import { Badge } from './model/badge';
import { Meeting } from '../src/meeting';
import { BadgeMapper } from './badge-mapper';

let dummyWork = function (seconds = 0) {
    if (seconds) {
        console.log(moment() + ' Doing dummy work for seconds: ' + seconds);
    }

    let tmp = 12;
    let targetTime =  moment().add(seconds, 'seconds');
    while (targetTime.valueOf() >= moment().valueOf()) {
        tmp = tmp * tmp;
    }

    if (seconds) {
        console.log(moment() + ' Done dummy work.');
    }
}

describe("meeting", () => {

    it("should follow the meeting workflow", () => {
        var mapper = new BadgeMapper('../test/badge-mapping.json', false);
        var meeting = new Meeting();

        var processBadge = (b: Badge): void => {
            if (mapper.enrichBadge(b)) {
                meeting.addBadge(b);
            }
        };

        // mapped, but before meeting
        processBadge({
            id: 'a',
            lastScan: new Date()
        } as Badge);
        

        expect(meeting.getMeetingBadges().length).toBe(0);

        dummyWork();
        meeting.startMeeting();
        dummyWork();

        expect(meeting.getMeetingBadges().length).toBe(0);

        // mapped
        processBadge({
            id: 'b',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(1);

        // unmapped Badge
        processBadge({
            id: 'asdf',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(1);

        // mapped
        processBadge({
            id: 'c',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(2);

        meeting.endMeeting();

        expect(meeting.getMeetingBadges().length).toBe(2);
    });

});
