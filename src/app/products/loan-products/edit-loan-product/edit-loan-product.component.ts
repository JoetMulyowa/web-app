/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { LoanProductDetailsStepComponent } from '../loan-product-stepper/loan-product-details-step/loan-product-details-step.component';
import { LoanProductCurrencyStepComponent } from '../loan-product-stepper/loan-product-currency-step/loan-product-currency-step.component';
import { LoanProductTermsStepComponent } from '../loan-product-stepper/loan-product-terms-step/loan-product-terms-step.component';
import { LoanProductSettingsStepComponent } from '../loan-product-stepper/loan-product-settings-step/loan-product-settings-step.component';
import { LoanProductChargesStepComponent } from '../loan-product-stepper/loan-product-charges-step/loan-product-charges-step.component';
import { LoanProductAccountingStepComponent } from '../loan-product-stepper/loan-product-accounting-step/loan-product-accounting-step.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';
import { LoanProducts } from '../loan-products';
import {
  AdvancedCreditAllocation,
  AdvancedPaymentAllocation,
  AdvancedPaymentStrategy,
  CapitalizedIncome,
  CreditAllocation,
  PaymentAllocation
} from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { Accounting } from 'app/core/utils/accounting';
import { LoanProductInterestRefundStepComponent } from '../loan-product-stepper/loan-product-interest-refund-step/loan-product-interest-refund-step.component';
import { StringEnumOptionData } from '../../../shared/models/option-data.model';
import { LoanProductCapitalizedIncomeStepComponent } from '../loan-product-stepper/loan-product-capitalized-income-step/loan-product-capitalized-income-step.component';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'mifosx-edit-loan-product',
  templateUrl: './edit-loan-product.component.html',
  styleUrls: ['./edit-loan-product.component.scss']
})
export class EditLoanProductComponent implements OnInit {
  @ViewChild(LoanProductDetailsStepComponent, { static: true }) loanProductDetailsStep: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductCurrencyStepComponent, { static: true })
  loanProductCurrencyStep: LoanProductCurrencyStepComponent;
  @ViewChild(LoanProductInterestRefundStepComponent, { static: true })
  loanProductInterestRefundStep: LoanProductInterestRefundStepComponent;
  @ViewChild(LoanProductCapitalizedIncomeStepComponent, { static: true })
  loanProductCapitalizedIncomeStep: LoanProductCapitalizedIncomeStepComponent;
  @ViewChild(LoanProductTermsStepComponent, { static: true }) loanProductTermsStep: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent, { static: true })
  loanProductSettingsStep: LoanProductSettingsStepComponent;
  @ViewChild(LoanProductChargesStepComponent, { static: true }) loanProductChargesStep: LoanProductChargesStepComponent;
  @ViewChild(LoanProductAccountingStepComponent, { static: true })
  loanProductAccountingStep: LoanProductAccountingStepComponent;

  loanProductAndTemplate: any;
  accountingRuleData: string[] = [];
  itemsByDefault: GlobalConfiguration[] = [];

  isAdvancedPaymentStrategy = false;
  wasPaymentAllocationChanged = false;
  paymentAllocation: PaymentAllocation[] = [];
  creditAllocation: CreditAllocation[] = [];
  advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  advancedCreditAllocations: AdvancedCreditAllocation[] = [];
  supportedInterestRefundTypes: StringEnumOptionData[] = [];

  capitalizedIncome: CapitalizedIncome | null = null;
  loanIncomeCapitalizationForm: UntypedFormGroup | null = null;

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ProductsService} productsService Product Service.
   * @param {LoanProducts} loanProducts LoanProducts
   * @param {Router} router Router for navigation.
   */

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private loanProducts: LoanProducts,
    private router: Router,
    private accounting: Accounting,
    private advancedPaymentStrategy: AdvancedPaymentStrategy
  ) {
    this.route.data.subscribe((data: { loanProductAndTemplate: any; configurations: any }) => {
      this.loanProductAndTemplate = data.loanProductAndTemplate;
      const assetAccountData = this.loanProductAndTemplate.accountingMappingOptions.assetAccountOptions || [];
      const liabilityAccountData = this.loanProductAndTemplate.accountingMappingOptions.liabilityAccountOptions || [];
      this.loanProductAndTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions =
        assetAccountData.concat(liabilityAccountData);

      this.itemsByDefault = loanProducts.setItemsByDefault(data.configurations);
      this.loanProductAndTemplate['itemsByDefault'] = this.itemsByDefault;
    });
  }

  ngOnInit() {
    this.accountingRuleData = this.accounting.getAccountingRulesForLoans();
    this.buildAdvancedPaymentAllocation();
    this.advancePaymentStrategy(this.loanProductAndTemplate.transactionProcessingStrategyCode);
    if (this.isAdvancedPaymentStrategy) {
      this.paymentAllocation = this.loanProductAndTemplate.paymentAllocation;
      this.creditAllocation = this.loanProductAndTemplate.creditAllocation;
      this.supportedInterestRefundTypes = this.loanProductAndTemplate.supportedInterestRefundTypes;
      if (this.loanProductAndTemplate.enableIncomeCapitalization) {
        this.capitalizedIncome = {
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType: this.loanProductAndTemplate.capitalizedIncomeCalculationType.id,
          capitalizedIncomeStrategy: this.loanProductAndTemplate.capitalizedIncomeStrategy.id,
          capitalizedIncomeType: this.loanProductAndTemplate.capitalizedIncomeType.id
        };
      } else {
        this.capitalizedIncome = {
          enableIncomeCapitalization: false
        };
      }
    }
  }

  get loanProductDetailsForm() {
    return this.loanProductDetailsStep.loanProductDetailsForm;
  }

  get loanProductCurrencyForm() {
    return this.loanProductCurrencyStep.loanProductCurrencyForm;
  }

  get loanProductTermsForm() {
    return this.loanProductTermsStep.loanProductTermsForm;
  }

  get loanProductSettingsForm() {
    return this.loanProductSettingsStep.loanProductSettingsForm;
  }

  get loanProductInterestRefundForm() {
    if (this.loanProductInterestRefundStep != null) {
      return this.loanProductInterestRefundStep.loanProductInterestRefundForm;
    }
  }

  setViewChildForm(viewChildForm: UntypedFormGroup): void {
    this.loanIncomeCapitalizationForm = viewChildForm;
  }

  advancePaymentStrategy(value: string): void {
    this.isAdvancedPaymentStrategy = LoanProducts.isAdvancedPaymentAllocationStrategy(value);
  }

  buildAdvancedPaymentAllocation(): void {
    this.advancedPaymentAllocations = this.advancedPaymentStrategy.buildAdvancedPaymentAllocationList(
      this.loanProductAndTemplate
    );
    this.advancedCreditAllocations = this.advancedPaymentStrategy.buildAdvancedCreditAllocationList(
      this.loanProductAndTemplate
    );
  }

  setPaymentAllocation(paymentAllocation: PaymentAllocation[]): void {
    this.paymentAllocation = paymentAllocation;
    this.wasPaymentAllocationChanged = true;
  }

  setCreditAllocation(creditAllocation: CreditAllocation[]): void {
    this.creditAllocation = creditAllocation;
    this.wasPaymentAllocationChanged = true;
  }

  setSupportedInterestRefundTypes(supportedInterestRefundTypes: StringEnumOptionData[]): void {
    this.supportedInterestRefundTypes = supportedInterestRefundTypes;
  }

  paymentAllocationChanged(value: boolean): void {
    this.wasPaymentAllocationChanged = value;
  }

  setCapitalizedIncome(capitalizedIncome: CapitalizedIncome): void {
    if (this.isAdvancedPaymentStrategy) {
      this.capitalizedIncome = capitalizedIncome;
    }
  }

  get loanProductAccountingForm() {
    return this.loanProductAccountingStep.loanProductAccountingForm;
  }

  get loanProductFormValidAndNotPristine() {
    if (this.isAdvancedPaymentStrategy) {
      return (
        this.loanProductDetailsForm.valid &&
        this.loanProductCurrencyForm.valid &&
        this.loanProductTermsForm.valid &&
        this.loanProductSettingsForm.valid &&
        this.loanProductAccountingForm.valid &&
        this.loanIncomeCapitalizationForm != null &&
        this.loanIncomeCapitalizationForm.valid &&
        (!this.loanProductDetailsForm.pristine ||
          !this.loanProductCurrencyForm.pristine ||
          !this.loanProductTermsForm.pristine ||
          !this.loanProductSettingsForm.pristine ||
          !this.loanProductChargesStep.pristine ||
          !this.loanProductAccountingForm.pristine ||
          !this.loanIncomeCapitalizationForm.pristine ||
          this.wasPaymentAllocationChanged)
      );
    } else {
      return (
        this.loanProductDetailsForm.valid &&
        this.loanProductCurrencyForm.valid &&
        this.loanProductTermsForm.valid &&
        this.loanProductSettingsForm.valid &&
        this.loanProductAccountingForm.valid &&
        (!this.loanProductDetailsForm.pristine ||
          !this.loanProductCurrencyForm.pristine ||
          !this.loanProductTermsForm.pristine ||
          !this.loanProductSettingsForm.pristine ||
          !this.loanProductChargesStep.pristine ||
          !this.loanProductAccountingForm.pristine ||
          this.wasPaymentAllocationChanged)
      );
    }
  }

  get loanProduct() {
    const loanProduct = {
      ...this.loanProductDetailsStep.loanProductDetails,
      ...this.loanProductCurrencyStep.loanProductCurrency,
      ...this.loanProductTermsStep.loanProductTerms,
      ...this.loanProductSettingsStep.loanProductSettings,
      ...this.loanProductChargesStep.loanProductCharges,
      ...this.loanProductAccountingStep.loanProductAccounting
    };
    // Default empty array
    loanProduct['paymentAllocation'] = [];
    loanProduct['creditAllocation'] = [];
    loanProduct['supportedInterestRefundTypes'] = [];
    if (this.isAdvancedPaymentStrategy) {
      loanProduct['paymentAllocation'] = this.paymentAllocation;
      loanProduct['creditAllocation'] = this.creditAllocation;
      loanProduct['supportedInterestRefundTypes'] = this.supportedInterestRefundTypes;
      if (this.capitalizedIncome != null) {
        loanProduct['enableIncomeCapitalization'] = this.capitalizedIncome.enableIncomeCapitalization;
        if (this.capitalizedIncome.enableIncomeCapitalization) {
          loanProduct['capitalizedIncomeCalculationType'] = this.capitalizedIncome.capitalizedIncomeCalculationType;
          loanProduct['capitalizedIncomeStrategy'] = this.capitalizedIncome.capitalizedIncomeStrategy;
          loanProduct['capitalizedIncomeType'] = this.capitalizedIncome.capitalizedIncomeType;
        }
      }
    }
    return loanProduct;
  }

  submit() {
    const loanProduct = this.loanProducts.buildPayload(this.loanProduct, this.itemsByDefault);
    if (loanProduct['useDueForRepaymentsConfigurations'] === true) {
      loanProduct['dueDaysForRepaymentEvent'] = null;
      loanProduct['overDueDaysForRepaymentEvent'] = null;
    }
    if (this.isAdvancedPaymentStrategy) {
      loanProduct['supportedInterestRefundTypes'] = this.mapStringEnumOptionToIdList(
        loanProduct['supportedInterestRefundTypes']
      );
    } else {
      delete loanProduct['supportedInterestRefundTypes'];
      delete loanProduct['daysInYearCustomStrategy'];
    }
    delete loanProduct['useDueForRepaymentsConfigurations'];

    this.productsService.updateLoanProduct(this.loanProductAndTemplate.id, loanProduct).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }

  mapStringEnumOptionToIdList(incomingValues: StringEnumOptionData[]): string[] {
    return incomingValues.map((v) => v.id);
  }
}
