/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Reports data resolver.
 */
@Injectable()
export class ReportsResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Reports data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getReports();
  }
}
