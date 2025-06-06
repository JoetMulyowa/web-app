/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ReportsService } from '../reports.service';

/**
 * Reports data resolver.
 */
@Injectable()
export class ReportsResolver {
  /**
   * @param {ReportsService} reportsService Reports service.
   */
  constructor(private reportsService: ReportsService) {}

  /**
   * Returns the reports data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.reportsService.getReports();
  }
}
