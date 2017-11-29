import { Badge } from './model/badge';
import { Moment } from "moment";

export interface CostCalculator {

    calculateCosts(startTime: Moment, endTime: Moment, badges: Badge[]): number;

}
