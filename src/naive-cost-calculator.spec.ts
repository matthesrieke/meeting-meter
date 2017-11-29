import { NaiveCostCalculator } from './naive-cost-calculator';
import * as moment from 'moment';
import { Moment } from 'moment'

import { Badge } from './model/badge';


describe("naive cost calculator", () => {
    it("should calculate the total costs correctly", () => {

        const badges = [];

        badges.push({
            id: 'a',
            lastScan: new Date(),
            hourlyRate: 14
        } as Badge);

        badges.push({
            id: 'b',
            lastScan: new Date(),
            hourlyRate: 35
        } as Badge);

        badges.push({
            id: 'c',
            lastScan: new Date(),
            hourlyRate: 60
        } as Badge);

        const calc = new NaiveCostCalculator();
        const now = moment();
        const then = moment().add(5, 'seconds');
        const thenLater = moment().add(30, 'minutes');
        const thenEvenLater = moment().add(1, 'hour');

        expect(calc.calculateCosts(now, then, badges)).toBeCloseTo(0.15, 2);
        expect(calc.calculateCosts(now, thenLater, badges)).toBeCloseTo(54.50, 2);
        expect(Math.round(calc.calculateCosts(now, thenEvenLater, badges))).toBe(109);

    });
});
