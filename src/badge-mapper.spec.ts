import { Badge } from './model/badge';
import { BadgeMapper } from './badge-mapper';


describe("BadgeMapper", () => {
    it("unmapped Badges should be as expected", (done) => {

        var bm = new BadgeMapper('../test/badge-mapping.json', false);

        expect(bm.getBadgeMapping()).toBeDefined();
        expect(Object.keys(bm.getBadgeMapping()).length).toBe(3);
        expect(bm.getBadgeMapping()['a']).toBe('WM');
        expect(bm.getBadgeMapping()['b']).toBe('SH');
        expect(bm.getBadgeMapping()['c']).toBe('GL');

        bm.mapBadge({
            id: 'xyz',
            lastScan: new Date()
        } as Badge, 'WM');
        
        expect(Object.keys(bm.getBadgeMapping()).length).toBe(4);

        bm.persist('/tmp/badge-test.json').then(() => {
            // more tests on written file
            const bm2 = new BadgeMapper('/tmp/badge-test.json');
            expect(Object.keys(bm2.getBadgeMapping()).length).toBe(4);
            expect(bm2.getBadgeMapping()['a']).toBe('WM');
            expect(bm2.getBadgeMapping()['b']).toBe('SH');
            expect(bm2.getBadgeMapping()['c']).toBe('GL');
            expect(bm2.getBadgeMapping()['xyz']).toBe('WM');

            bm2.mapBadge({
                id: '1234',
                lastScan: new Date()
            } as Badge, 'GL');
            bm2.mapBadge({
                id: '5678',
                lastScan: new Date()
            } as Badge, 'GL');

            bm2.persist().then(() => {
                const bm3 = new BadgeMapper('/tmp/badge-test.json');
                expect(Object.keys(bm3.getBadgeMapping()).length).toBe(6);
                expect(bm3.getBadgeMapping()['1234']).toBe('GL');
                expect(bm3.getBadgeMapping()['5678']).toBe('GL');
                done();
            }).catch(err => {
                expect('Error').toBeUndefined();
            });

        }).catch(err => {
            expect('Error').toBeUndefined();
        });

        
    });
});
