import { Meeting } from '../src/meeting';

describe("meeting tests", () => {
    it("should be true", () => {
        expect(true).toBe(true);
        var meeting = new Meeting();
        expect(meeting.getMeetingBadgets().length).toBe(0);
    });
});
