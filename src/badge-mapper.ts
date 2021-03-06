import { Badge } from './model/badge';
import * as sallary from './sallary.json';
import * as fs from 'fs';

export class BadgeMapper {

    private fileName: string;
    private badgeMapping: any;

    constructor(filePath?: string, absolute = true) {
        absolute = filePath ? absolute : false;

        const targetfileName = filePath || 'badge-mapping.json';
        this.fileName = absolute ? targetfileName : __dirname + '/' + targetfileName;

        console.log('Reading maping file: ' + this.fileName);

        const content = fs.readFileSync(this.fileName, { encoding: 'utf8' });
        this.badgeMapping = JSON.parse(content);
    };

    /**
     * 
     * @param b the badge
     * @param category the category to map
     */
    public mapBadge(b: Badge, category: string): void {
        if (!sallary[category]) {
            console.warn('Unsupported category: ' + category);
        }
        else {
            const sal = sallary[category];
            b.category = category;
            b.hourlyRate = sal;
            this.badgeMapping[b.id] = category;
        }
    };

    public getCategories(): string[] {
        return Object.keys(sallary);
    }

    /**
     * returns true if the badge could be enriched (= found in mappings)
     * @param b the badge
     */
    public enrichBadge(b: Badge): boolean {
        if (this.badgeMapping[b.id]) {
            const cat = this.badgeMapping[b.id];
            const sal = sallary[cat];
            b.hourlyRate = sal;
            b.category = cat;
            return true;
        }

        return false;
    }

    public getBadgeMapping(): any {
        return this.badgeMapping;
    }

    public persist(filePath?: string, absolute = true): Promise<void> {
        let target;
        if (!filePath) {
            target = this.fileName;
        } else {
            target = absolute ? filePath : __dirname + '/' + filePath;
        }

        return new Promise<void>((resolve, reject) => {
            fs.writeFile(target,
                JSON.stringify(this.badgeMapping, null, 4),
                (err) => {
                    if (err) {
                        console.warn('Could not write badge mappings: ' + err);
                        reject(err);
                    } else {
                        resolve();
                    }

                });
        });
    }

}
