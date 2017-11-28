import { Badge } from './model/badge';

import * as sallary from './sallary.json';
import * as badgeMapping from './badge-mapping.json';

export class Meeting {

    private scannedBadges = {};
    private startDate: Date;
    
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
            .filter((b: Badge) => b.category && b.hourlyRate && b.lastScan > this.startDate);
    }
    
    public startMeeting(): void {
        this.startDate = new Date();
        console.log('Meeting started: ' + this.startDate);
    };
    
    public endMeeting(): void {
        delete this.startDate;
    };

    public getStartDate(): Date {
        return this.startDate;
    }
    
    public onBadgeScanned(b: Badge): void {
        if (badgeMapping[b.id]) {
            const category = badgeMapping[b.id];

            if (!sallary[category]) {
                console.warn('Unsupported category: ' + category);
            } else {
                b.hourlyRate = sallary[category];
                b.category = category;
            }

        }
    
        this.scannedBadges[b.id] = b;
        console.log('Scanned badge: ' + JSON.stringify(b));
    };
    
}
