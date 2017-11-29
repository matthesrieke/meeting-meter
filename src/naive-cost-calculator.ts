import { Badge } from './model/badge';
import { CostCalculator } from './cost-calculator';
import { Moment } from 'moment';

export class NaiveCostCalculator implements CostCalculator {

    public calculateCosts(startTime: Moment, endTime: Moment, badges: Badge[]): number {
        if (badges.length === 0) {
            return 0;
        }

        const secondDelta = endTime.diff(startTime, 'second');

        let total = badges.map(b => {
            return b.hourlyRate / 60 / 60 * secondDelta;
        }).reduce((a, b) => a + b);

        total = Math.round(total * 100) / 100;
        console.log('Total costs: ' + total + '€');

        return total;
    }

}