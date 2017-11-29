import * as moment from 'moment';
import { Moment } from 'moment'

import { BadgeMapper } from './badge-mapper';
import { Badge } from './model/badge';
import { NaiveCostCalculator } from './naive-cost-calculator';


export class Meeting {

    private calculator: NaiveCostCalculator = new NaiveCostCalculator();
    private scannedBadges = {};
    private startDate: Moment;
    private endDate: Moment;

    constructor(private mapper: BadgeMapper) {
    }
    
    public getUnmappedBadges(): Badge[] {
        return Object.keys(this.scannedBadges)
            .map(k => this.scannedBadges[k])
            .filter((b: Badge) => !b.category && !b.hourlyRate);
    };
    
    public getMeetingBadges(): Badge[] {
        if (!this.startDate) {
            return [];
        }

        return Object.keys(this.scannedBadges)
            .map(k => this.scannedBadges[k])
            .filter((b: Badge) => b.category && b.hourlyRate && b.lastScan.valueOf() > this.startDate.valueOf());
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
    
    public onBadgeScanned(b: Badge): void {
        if (!this.startDate || this.endDate) {
            return;
        }

        const badgeMapping = this.mapper.getBadgeMapping();
        if (badgeMapping[b.id]) {
            const category = badgeMapping[b.id];

            this.mapper.mapBadge(b, category);
        }
    
        this.scannedBadges[b.id] = b;
    };

    public calculateTotalCosts(): number {
        const target = this.endDate || moment();
        const badges = this.getMeetingBadges();

        return this.calculator.calculateCosts(this.startDate, target, badges);
    }
    
}
