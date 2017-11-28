import { Badge } from './model/badge';
import { Meeting } from '../src/meeting';
import { BadgeMapper } from './badge-mapper';

let dummyWork = function() {
    let tmp = 12;
    let now = new Date();
    while (!(now < new Date())) {
        tmp = tmp * tmp;
    }
}

describe("meeting", () => {
    it("unmapped Badges should be as expected", () => {

        var meeting = new Meeting(new BadgeMapper());
        expect(meeting.getUnmappedBadges().length).toBe(0);

        // mapped
        meeting.onBadgeScanned({
            id: '1231232136',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getUnmappedBadges().length).toBe(0);

        // unmapped Badge
        meeting.onBadgeScanned({
            id: 'asdf',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getUnmappedBadges().length).toBe(1);
    });

    it("should follow the meeting workflow", () => {

        var meeting = new Meeting(new BadgeMapper());

        // mapped, but before meeting
        meeting.onBadgeScanned({
            id: '1231232136',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(0);
        
        dummyWork();
        meeting.startMeeting();
        dummyWork();

        expect(meeting.getMeetingBadges().length).toBe(0);

        // mapped
        meeting.onBadgeScanned({
            id: '1231232136',
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
            id: '3234542237',
            lastScan: new Date()
        } as Badge);

        expect(meeting.getMeetingBadges().length).toBe(2);

        meeting.endMeeting();

        expect(meeting.getMeetingBadges().length).toBe(0);
    });
});
