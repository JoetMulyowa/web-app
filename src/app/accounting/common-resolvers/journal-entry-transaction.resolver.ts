/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Transaction data resolver.
 */
@Injectable()
export class JournalEntryTransactionResolver {
  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the transaction data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transactionId = route.paramMap.get('id');
    return this.accountingService.getJournalEntry(transactionId);
  }
}
