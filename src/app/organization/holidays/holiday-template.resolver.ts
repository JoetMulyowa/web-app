/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Holiday data template resolver.
 */
@Injectable()
export class HolidayTemplateResolver {
  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the holiday data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getHolidayTemplate();
  }
}
