import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  aggregateByMonth(data: any[], dateField: string, valueField: string): { labels: string[], values: number[] } {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const aggregated: { [key: string]: number } = {};
    
    monthNames.forEach(m => aggregated[m] = 0);

    data.forEach(item => {
      const dateVal = item[dateField];
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const month = monthNames[d.getMonth()];
          aggregated[month] += (Number(item[valueField]) || 0);
        }
      }
    });

    return {
      labels: monthNames,
      values: monthNames.map(m => aggregated[m])
    };
  }

  aggregateCountByMonth(data: any[], dateField: string): { labels: string[], values: number[] } {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const aggregated: { [key: string]: number } = {};
    
    monthNames.forEach(m => aggregated[m] = 0);

    data.forEach(item => {
      const dateVal = item[dateField];
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const month = monthNames[d.getMonth()];
          aggregated[month] += 1;
        }
      }
    });

    return {
      labels: monthNames,
      values: monthNames.map(m => aggregated[m])
    };
  }
}
