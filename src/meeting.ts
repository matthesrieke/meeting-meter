import * as moment from 'moment';
import { Moment } from 'moment'

import { Badge } from './model/badge';
import { NaiveCostCalculator } from './naive-cost-calculator';


export class Meeting {

    private calculator: NaiveCostCalculator = new NaiveCostCalculator();
    private scannedBadges = {};
    private startDate: Moment;
    private endDate: Moment;

    constructor() {
    }
      
    public getMeetingBadges(): Badge[] {
        return Object.keys(this.scannedBadges)
            .map(k => this.scannedBadges[k]);
    }
    
    public startMeeting(): void {
        this.startDate = moment();
        console.log('Meeting started: ' + this.startDate);
    };
    
    public endMeeting(): void {
        this.endDate = moment();
        console.log('Meeting ended: ' + this.startDate);
    };

    public getStartDate(): Moment {
        return this.startDate;
    }

    public getEndDate(): Moment {
        return this.endDate;
    }
    
    public addBadge(b: Badge): void {
        if (!this.startDate || this.endDate) {
            console.log('No meeting ongoing, cannot add badge');
            return;
        }
    
        this.scannedBadges[b.id] = b;
        console.log('Added badge to meeting: ' + b.id);
    };

    public calculateTotalCosts(): number {
        const target = this.endDate || moment();
        const badges = this.getMeetingBadges();

        return this.calculator.calculateCosts(this.startDate, target, badges);
    }
    
}
