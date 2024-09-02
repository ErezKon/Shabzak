import { BarChartModel } from "./bar-chart.model";

export interface GroupedBarChartModel {
    name: string;
    series: Array<BarChartModel>;
}