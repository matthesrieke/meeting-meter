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
    it("unmapped Badges should be as expected", () => {

        var meeting = new Meeting(new BadgeMapper('../test/badge-mapping.json', false));
        expect(meeting.getUnmappedBadges().length).toBe(0);

        // mapped
        meeting.onBadgeScanned({
            id: 'a',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getUnmappedBadges().length).toBe(0);

        // unmapped Badge
        meeting.onBadgeScanned({
            id: 'asdf',
            lastScan: new Date()
        } as Badge);

        // meeting not started!
        expect(meeting.getUnmappedBadges().length).toBe(0);

        meeting.startMeeting();
        // unmapped Badge
        meeting.onBadgeScanned({
            id: 'asdf',
            lastScan: new Date()
        } as Badge);

        // meeting not started!
        expect(meeting.getUnmappedBadges().length).toBe(1);
    });

    it("should follow the meeting workflow", () => {

        var meeting = new Meeting(new BadgeMapper('../test/badge-mapping.json', false));

        // mapped, but before meeting
        meeting.onBadgeScanned({
            id: 'a',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(0);

        dummyWork();
        meeting.startMeeting();
        dummyWork();

        expect(meeting.getMeetingBadges().length).toBe(0);

        // mapped
        meeting.onBadgeScanned({
            id: 'b',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(1);

        // unmapped Badge
        meeting.onBadgeScanned({
            id: 'asdf',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(1);

        // mapped
        meeting.onBadgeScanned({
            id: 'c',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(2);

        meeting.endMeeting();

        expect(meeting.getMeetingBadges().length).toBe(2);
    });

});
