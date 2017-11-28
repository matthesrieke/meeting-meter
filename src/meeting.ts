import { Badget } from './model/badget';

import * as sallary from './sallary.json';
import * as badgetMapping from './badget-mapping.json';

export class Meeting {

    private scannedBadgets = {};
    private startDate: Date;
    
    public getUnmappedBadgets(): Badget[] {
        return Object.keys(this.scannedBadgets)
            .map(k => this.scannedBadgets[k])
            .filter((b: Badget) => !b.category && !b.hourlyRate);
    };
    
    public getMeetingBadgets(): Badget[] {
        return Object.keys(this.scannedBadgets)
            .map(k => this.scannedBadgets[k])
            .filter((b: Badget) => !b.category && !b.hourlyRate);
    }
    
    public startMeeting(): void {
        this.startDate = new Date();
    };
    
    public endMeeting(): void {
    
    };
    
    public onBadgetScanned(b: Badget): void {
        if (badgetMapping[b.id]) {
            b.hourlyRate = badgetMapping[b.id];
        }
    
        this.scannedBadgets[b.id] = b;
    };
    
    public mapBadget(b: Badget, category: string): void {
        if (!sallary[category]) {
            console.warn('Unsupported category: ' + category);
        }
        else {
            const sal = sallary[category];
            b.category = category;
            b.hourlyRate = sal;
            this.scannedBadgets[b.id] = b;
        }
    };
}
