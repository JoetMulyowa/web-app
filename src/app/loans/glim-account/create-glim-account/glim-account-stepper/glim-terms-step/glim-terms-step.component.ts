/** Angular Imports */
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
// import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';
import { LoanProducts } from 'app/products/loan-products/loan-products';
import { LoanProduct } from 'app/products/loan-products/models/loan-product.model';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
// import { Currency } from 'app/shared/models/general.model';
import { CodeName, OptionData } from 'app/shared/models/option-data.model';

/**
 * Create GLIM Terms Step
 */
@Component({
  selector: 'mifosx-glim-terms-step',
  templateUrl: './glim-terms-step.component.html',
  styleUrls: ['./glim-terms-step.component.scss']
})
export class GlimTermsStepComponent implements OnInit, OnChanges {
  /** Loans Product Options */
  @Input() loansProductOptions: any;
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  loansAccountTermsData: any;

  /** Is Multi Disburse Loan  */
  multiDisburseLoan: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean;
  // @Input loanPrincipal: Loan Principle
  @Input() loanPrincipal: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Loans Account Terms Form */
  loansAccountTermsForm: UntypedFormGroup;
  /** Term Frequency Type Data */
  termFrequencyTypeData: any;
  /** Repayment Frequency Nth Day Type Data */
  repaymentFrequencyNthDayTypeData: any;
  /** Repayment Frequency Days of Week Type Data */
  repaymentFrequencyDaysOfWeekTypeData: any;
  /** Interest Type Data */
  interestTypeData: any;
  /** Amortization Type Data */
  amortizationTypeData: any;
  /** Interest Calculation Period Type Data */
  interestCalculationPeriodTypeData: any;
  /** Client Active Loan Data */
  clientActiveLoanData: any;
  /** Multi Disbursement Data */
  disbursementDataSource: {}[] = [];
  /** Loan repayment strategies */
  transactionProcessingStrategyOptions: any = [];
  repaymentStrategyDisabled = false;
  /** Disbursement Data Displayed Columns */
  disbursementDisplayedColumns: string[] = [
    'expectedDisbursementDate',
    'principal',
    'actions'
  ];
  /** Multi Disbursement Control */
  totalMultiDisbursed: any = 0;
  isMultiDisbursedCompleted = false;

  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;

  loanId: any = null;
  loanScheduleType: OptionData | null = null;
  loanProduct: LoanProduct | null = null;
  interestRateFrequencyTypeData: any[] = [];
  // currency: Currency;

  productEnableDownPayment = false;
  isProgressive = false;

  /**
   * Create Loans Account Terms Form
   * @param formBuilder FormBuilder
   * @param {SettingsService} settingsService SettingsService
   * @param {ActivatedRoute} route ActivatedRoute
   * @param {MatDialog} dialog MatDialog
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
    this.createGLIMTermsForm();
  }
  /**
   * Executes on change of input values
   */
  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      // this.currency = this.loansAccountProductTemplate.currency;

      this.loansAccountTermsData = this.loansAccountProductTemplate;
      if (this.loanId != null && this.loansAccountTemplate.accountNo) {
        this.loansAccountTermsData = this.loansAccountTemplate;
      }
      this.productEnableDownPayment = this.loansAccountTermsData.product.enableDownPayment;
      this.isProgressive =
        this.loansAccountTermsData.loanScheduleType.code == LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE;
      if (this.loansAccountTermsData.product) {
        this.loanProduct = this.loansAccountTermsData.product;
      }

      this.interestRateFrequencyTypeData = this.loansAccountTermsData.interestRateFrequencyTypeOptions;

      this.loansAccountTermsForm.patchValue({
        principalAmount: this.loansAccountTermsData.principal,
        loanTermFrequency: this.loansAccountTermsData.termFrequency,
        loanTermFrequencyType: this.loansAccountTermsData.termPeriodFrequencyType.id,
        numberOfRepayments: this.loansAccountTermsData.numberOfRepayments,
        repaymentEvery: this.loansAccountTermsData.repaymentEvery,
        repaymentFrequencyType: this.loansAccountTermsData.repaymentFrequencyType.id,
        amortizationType: this.loansAccountTermsData.amortizationType.id,
        isEqualAmortization: this.loansAccountTermsData.isEqualAmortization,
        interestType: this.loansAccountTermsData.interestType.id,
        isFloatingInterestRate: this.loansAccountTermsData.isLoanProductLinkedToFloatingRate ? false : '',
        interestCalculationPeriodType: this.loansAccountTermsData.interestCalculationPeriodType.id,
        allowPartialPeriodInterestCalculation: this.loansAccountTermsData.allowPartialPeriodInterestCalculation,
        inArrearsTolerance: this.loansAccountTermsData.inArrearsTolerance,
        graceOnInterestCharged: this.loansAccountTermsData.graceOnInterestCharged,
        fixedEmiAmount: this.loansAccountTermsData.fixedEmiAmount,
        maxOutstandingLoanBalance: this.loansAccountTermsData.maxOutstandingLoanBalance,
        transactionProcessingStrategyCode: this.loansAccountTermsData.transactionProcessingStrategyCode,
        interestRateDifferential: this.loansAccountTermsData.interestRateDifferential,
        multiDisburseLoan: this.loansAccountTermsData.multiDisburseLoan,
        interestRateFrequencyType: this.loansAccountTermsData.interestRateFrequencyType.id,
        balloonRepaymentAmount: this.loansAccountTermsData.balloonRepaymentAmount,
        interestRecognitionOnDisbursementDate: this.loansAccountTermsData.interestRecognitionOnDisbursementDate || false
      });

      this.setAdvancedPaymentStrategyControls();

      if (this.loansAccountTermsData.loanScheduleType.code == LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE) {
        this.loansAccountTermsForm.removeControl('interestRecognitionOnDisbursementDate');
      }

      if (this.loansAccountTermsData.isLoanProductLinkedToFloatingRate) {
        this.loansAccountTermsForm.removeControl('interestRatePerPeriod');
      }

      this.multiDisburseLoan = this.loansAccountTermsData.multiDisburseLoan;
      if (this.loansAccountTermsData.disbursementDetails) {
        this.disbursementDataSource = this.loansAccountTermsData.disbursementDetails;
        this.totalMultiDisbursed = 0;
        this.disbursementDataSource.forEach((item: any) => {
          this.totalMultiDisbursed += item.principal;
        });
      }
      if (this.isDelinquencyEnabled()) {
        this.loansAccountTermsForm.addControl(
          'enableInstallmentLevelDelinquency',
          new UntypedFormControl(
            this.loansAccountTermsData.enableInstallmentLevelDelinquency ||
              this.loanProduct.enableInstallmentLevelDelinquency
          )
        );
      }
      if (this.productEnableDownPayment) {
        const enableDownPayment = this.loansAccountTermsData['enableDownPayment'] === false ? false : true;
        this.loansAccountTermsForm.addControl('enableDownPayment', new UntypedFormControl(enableDownPayment));
      }

      const allowAttributeOverrides = this.loansAccountTermsData.product.allowAttributeOverrides;
      if (!allowAttributeOverrides.repaymentEvery) {
        this.loansAccountTermsForm.controls.repaymentEvery.disable();
        this.loansAccountTermsForm.controls.repaymentFrequencyType.disable();
      }
      if (!allowAttributeOverrides.interestType) {
        this.loansAccountTermsForm.controls.interestType.disable();
      }
      if (!allowAttributeOverrides.amortizationType) {
        this.loansAccountTermsForm.controls.amortizationType.disable();
      }
      if (!allowAttributeOverrides.interestCalculationPeriodType) {
        this.loansAccountTermsForm.controls.interestCalculationPeriodType.disable();
        this.loansAccountTermsForm.controls.allowPartialPeriodInterestCalculation.disable();
      }
      if (!allowAttributeOverrides.inArrearsTolerance) {
        this.loansAccountTermsForm.controls.inArrearsTolerance.disable();
      }
      if (!allowAttributeOverrides.transactionProcessingStrategyCode) {
        this.loansAccountTermsForm.controls.transactionProcessingStrategyCode.disable();
      }
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.loansAccountTermsData = this.loansAccountProductTemplate;
    if (this.loanId != null && this.loansAccountTemplate.accountNo) {
      this.loansAccountTermsData = this.loansAccountTemplate;
    }

    if (this.loansAccountTermsData) {
      if (this.loansAccountTermsData.loanProductId) {
        this.loansAccountTermsForm.patchValue({
          repaymentsStartingFromDate:
            this.loansAccountTermsData.expectedFirstRepaymentOnDate &&
            new Date(this.loansAccountTermsData.expectedFirstRepaymentOnDate)
        });
      }
      this.loansAccountTermsForm.patchValue({
        principalAmount: this.loansAccountTermsData.principal,
        loanTermFrequency: this.loansAccountTermsData.termFrequency,
        loanTermFrequencyType: this.loansAccountTermsData.termPeriodFrequencyType.id,
        numberOfRepayments: this.loansAccountTermsData.numberOfRepayments,
        repaymentEvery: this.loansAccountTermsData.repaymentEvery,
        repaymentFrequencyType: this.loansAccountTermsData.repaymentFrequencyType.id,
        amortizationType: this.loansAccountTermsData.amortizationType.id,
        isEqualAmortization: this.loansAccountTermsData.isEqualAmortization,
        interestType: this.loansAccountTermsData.interestType.id,
        isFloatingInterestRate: this.loansAccountTermsData.isLoanProductLinkedToFloatingRate ? false : '',
        interestCalculationPeriodType: this.loansAccountTermsData.interestCalculationPeriodType.id,
        allowPartialPeriodInterestCalculation: this.loansAccountTermsData.allowPartialPeriodInterestCalculation,
        inArrearsTolerance: this.loansAccountTermsData.inArrearsTolerance,
        graceOnInterestCharged: this.loansAccountTermsData.graceOnInterestCharged,
        fixedEmiAmount: this.loansAccountTermsData.fixedEmiAmount,
        maxOutstandingLoanBalance: this.loansAccountTermsData.maxOutstandingLoanBalance,
        transactionProcessingStrategyCode: this.loansAccountTermsData.transactionProcessingStrategyCode,
        interestRateDifferential: this.loansAccountTermsData.interestRateDifferential,
        multiDisburseLoan: this.loansAccountTermsData.multiDisburseLoan,
        interestRateFrequencyType: this.loansAccountTermsData.interestRateFrequencyType.id,
        balloonRepaymentAmount: this.loansAccountTermsData.balloonRepaymentAmount,
        interestRecognitionOnDisbursementDate: this.loansAccountTermsData.interestRecognitionOnDisbursementDate || false
      });
    }
    this.createGLIMTermsForm();
    this.setAdvancedPaymentStrategyControls();
    // this.setCustomValidators();
    this.setLoanTermListener();
  }

  allowAddDisbursementDetails() {
    return this.multiDisburseLoan && !this.loansAccountTermsData.disallowExpectedDisbursements;
  }

  /** Custom Validators for the form */
  //   setCustomValidators() {
  //     const repaymentFrequencyNthDayType = this.loansAccountTermsForm.get('repaymentFrequencyNthDayType');
  //     const repaymentFrequencyDayOfWeekType = this.loansAccountTermsForm.get('repaymentFrequencyDayOfWeekType');

  //     this.loansAccountTermsForm.get('repaymentFrequencyType').valueChanges.subscribe((repaymentFrequencyType) => {
  //       if (repaymentFrequencyType === 2) {
  //         repaymentFrequencyNthDayType.setValidators([Validators.required]);
  //         repaymentFrequencyDayOfWeekType.setValidators([Validators.required]);
  //       } else {
  //         repaymentFrequencyNthDayType.setValidators(null);
  //         repaymentFrequencyDayOfWeekType.setValidators(null);
  //       }

  //       repaymentFrequencyNthDayType.updateValueAndValidity();
  //       repaymentFrequencyDayOfWeekType.updateValueAndValidity();
  //     });
  //   }

  /** Custom Listeners for the form to calculate Loan Term */
  setLoanTermListener() {
    this.loansAccountTermsForm.get('numberOfRepayments').valueChanges.subscribe((numberOfRepayments) => {
      const repaymentEvery: number = this.loansAccountTermsForm.value.repaymentEvery;
      this.calculateLoanTerm(numberOfRepayments, repaymentEvery);
    });

    this.loansAccountTermsForm.get('repaymentEvery').valueChanges.subscribe((repaymentEvery) => {
      const numberOfRepayments: number = this.loansAccountTermsForm.value.numberOfRepayments;
      this.calculateLoanTerm(numberOfRepayments, repaymentEvery);
    });

    this.loansAccountTermsForm.get('loanTermFrequencyType').valueChanges.subscribe((loanTermFrequencyType) => {
      this.loansAccountTermsForm.patchValue({ repaymentFrequencyType: loanTermFrequencyType });
    });

    this.loansAccountTermsForm.get('amortizationType').valueChanges.subscribe((amortizationType) => {
      if (amortizationType === 0) {
        // Equal Principal Payments
        this.loansAccountTermsForm.addControl('fixedPrincipalPercentagePerInstallment', new UntypedFormControl(''));
      } else {
        // Equal Installments
        this.loansAccountTermsForm.removeControl('fixedPrincipalPercentagePerInstallment');
      }
    });
  }

  setAdvancedPaymentStrategyControls(): void {
    // Fixed Length validation
    if (this.loansAccountTermsData) {
      this.loansAccountTermsForm.removeControl('interestRatePerPeriod');
      this.loansAccountTermsForm.removeControl('fixedLength');
      if (this.loansAccountTermsData.product.fixedLength) {
        this.loansAccountTermsForm.addControl(
          'interestRatePerPeriod',
          new UntypedFormControl({ value: 0, disabled: true }, Validators.required)
        );
        this.loansAccountTermsForm.addControl(
          'fixedLength',
          new UntypedFormControl(this.loansAccountTermsData.product.fixedLength)
        );
      } else {
        this.loansAccountTermsForm.addControl(
          'interestRatePerPeriod',
          new UntypedFormControl(this.loansAccountTermsData.interestRatePerPeriod, Validators.required)
        );
      }
    }
  }

  hasFixedLength(): boolean {
    if (this.loansAccountTermsData) {
      return this.loansAccountTermsData.product?.fixedLength ? true : false;
    }
    return false;
  }

  isEqualPrincipalPayments(): boolean {
    return this.loansAccountTermsForm.value.amortizationType === 0;
  }

  /** Create Loans Account Terms Form */
  createGLIMTermsForm() {
    this.loansAccountTermsForm = this.formBuilder.group({
      principalAmount: [
        '',
        Validators.required
      ],
      loanTermFrequency: [
        { value: '', disabled: true },
        Validators.required
      ],
      loanTermFrequencyType: [
        '',
        Validators.required
      ],
      numberOfRepayments: [
        '',
        Validators.required
      ],
      repaymentEvery: [
        '',
        Validators.required
      ],
      repaymentFrequencyType: [
        { value: '', disabled: true },
        Validators.required
      ],
      repaymentFrequencyNthDayType: [''],
      repaymentFrequencyDayOfWeekType: [''],
      repaymentsStartingFromDate: [''],
      interestChargedFromDate: [''],
      interestRatePerPeriod: [''],
      interestType: [''],
      isFloatingInterestRate: [''],
      isEqualAmortization: [''],
      amortizationType: [
        '',
        Validators.required
      ],
      interestCalculationPeriodType: [''],
      allowPartialPeriodInterestCalculation: [''],
      inArrearsTolerance: [''],
      graceOnInterestCharged: [''],
      loanIdToClose: [''],
      fixedEmiAmount: [''],
      isTopup: [''],
      maxOutstandingLoanBalance: [''],
      interestRateDifferential: [''],
      transactionProcessingStrategyCode: [
        '',
        Validators.required
      ],
      multiDisburseLoan: [false],
      interestRateFrequencyType: [''],
      balloonRepaymentAmount: [''],
      interestRecognitionOnDisbursementDate: [false]
    });
  }

  calculateLoanTerm(numberOfRepayments: number, repaymentEvery: number): void {
    const loanTerm = numberOfRepayments * repaymentEvery;
    this.loansAccountTermsForm.patchValue({ loanTermFrequency: loanTerm });
  }

  /**
   * Gets the Disbursement Data array.
   * @returns {Array} Disbursement Data array.
   */
  get disbursementData() {
    return {
      disbursementData: this.disbursementDataSource
    };
  }

  /**
   * Adds the Disbursement Data entry form to given Disbursement Data entry.
   */
  addDisbursementDataEntry() {
    const currentPrincipalAmount = this.loansAccountTermsForm.get('principalAmount').value;
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'expectedDisbursementDate',
        label: 'Expected Disbursement Date',
        value: new Date() || '',
        type: 'datetime-local',
        minDate: this.minDate,
        maxDate: this.maxDate,
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'principal',
        label: `Principal(It should be less than equal to the ${currentPrincipalAmount})`,
        value: '',
        type: 'number',
        required: true,
        order: 2
      })

    ];
    const data = {
      title: 'Add Disbursement Details',
      layout: { addButtonText: 'Add' },
      formfields: formfields
    };
    const disbursementDialogRef = this.dialog.open(FormDialogComponent, { data });
    disbursementDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const principal = response.data.value.principal * 1;
        if (this.totalMultiDisbursed + principal <= currentPrincipalAmount) {
          this.disbursementDataSource = this.disbursementDataSource.concat(response.data.value);
          this.totalMultiDisbursed += principal;
          this.isMultiDisbursedCompleted = this.totalMultiDisbursed === currentPrincipalAmount;
          this.pristine = false;
        }
      }
    });
  }

  /**
   * Removes the Disbursement Data entry form from given Disbursement Data entry form array at given index.
   * @param {number} index Array index from where Disbursement Data entry form needs to be removed.
   */
  removeDisbursementDataEntry(index: number) {
    const currentPrincipalAmount = this.loansAccountTermsForm.get('principalAmount').value;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const principal = this.disbursementDataSource[index]['principal'] * 1;
        this.disbursementDataSource.splice(index, 1);
        this.disbursementDataSource = this.disbursementDataSource.concat([]);
        this.totalMultiDisbursed -= principal;
        this.isMultiDisbursedCompleted = this.totalMultiDisbursed === currentPrincipalAmount;
      }
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.termFrequencyTypeData = this.loansAccountProductTemplate.termFrequencyTypeOptions;
    this.repaymentFrequencyNthDayTypeData = this.loansAccountProductTemplate.repaymentFrequencyNthDayTypeOptions;
    this.repaymentFrequencyDaysOfWeekTypeData =
      this.loansAccountProductTemplate.repaymentFrequencyDaysOfWeekTypeOptions;
    this.interestTypeData = this.loansAccountProductTemplate.interestTypeOptions;
    this.amortizationTypeData = this.loansAccountProductTemplate.amortizationTypeOptions;
    this.interestCalculationPeriodTypeData = this.loansAccountProductTemplate.interestCalculationPeriodTypeOptions;
    this.clientActiveLoanData = this.loansAccountProductTemplate.clientActiveLoanOptions;
    this.loanScheduleType = this.loansAccountProductTemplate.loanScheduleType;
    this.transactionProcessingStrategyOptions = [];
    if (this.loanScheduleType.code === LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE) {
      // Filter Advanced Payment Allocation Strategy
      this.transactionProcessingStrategyOptions =
        this.loansAccountProductTemplate.transactionProcessingStrategyOptions.filter(
          (cn: CodeName) => !LoanProducts.isAdvancedPaymentAllocationStrategy(cn.code)
        );
      this.repaymentStrategyDisabled = false;
    } else {
      // Only Advanced Payment Allocation Strategy
      this.loansAccountProductTemplate.transactionProcessingStrategyOptions.some((cn: CodeName) => {
        if (LoanProducts.isAdvancedPaymentAllocationStrategy(cn.code)) {
          this.transactionProcessingStrategyOptions.push(cn);
        }
      });
      this.repaymentStrategyDisabled = true;
    }
  }

  isDelinquencyEnabled(): boolean {
    return !!this.loanProduct?.delinquencyBucket?.name;
  }

  /**
   * Returns loans account terms form value.
   */
  get loansAccountTerms() {
    return this.loansAccountTermsForm.getRawValue();
  }
}
