import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { columnsModel } from '../../../core/models/columnsModel';
import { ENDPOINTS } from '../../../core/endpoints';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { InputDetail } from '../../../core/models/input-detail';
import { ApiResponse } from '../../../core/models/api-response';
import { ComplianceCategory } from '../../../core/models/compliance-category';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { ComplianceConfig } from '../../../core/models/compliance-config';

@Component({
  selector: 'app-compliance-items',
  imports: [CommonModule, ReactiveFormsModule, BootstrapTableComponent],
  templateUrl: './compliance-items.html',
  styleUrl: './compliance-items.scss',
})
export class ComplianceItems implements OnInit {
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedComplianceConfig: ComplianceConfig | null = null;

  allComplianceConfigs = signal<ComplianceConfig[]>([]);
  industryTypes = signal<InputDetail[]>([]);
  allComplianceCategories = signal<ComplianceCategory[]>([]);
  complianceCategories = signal<ComplianceCategory[]>([]);
  form!: FormGroup;

  readonly riskOptions = ['High', 'Medium', 'Low'];

  public columns: Array<columnsModel> = [
    { caption: 'S. N', dataField: 'sNumber', isTemplate: false },
    { caption: 'Industry Type', dataField: 'industryTypeName', isTemplate: false, isTooltip: false },
    { caption: 'Compliance Category', dataField: 'complianceCategoryName', isTemplate: false, isTooltip: false },
    { caption: 'Compliance Item', dataField: 'complianceItem', isTemplate: false, isTooltip: false },
    { caption: 'Risk Category', dataField: 'riskCategory', isTemplate: false, isTooltip: false },
    { caption: 'Action', dataField: 'Action', isTemplate: true },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getIndustryTypes();
    this.listenIndustryTypeChanges();
  }

  createForm(): void {
    this.form = this.fb.group({
      industryTypeId: ['', Validators.required],
      complianceCategoryId: ['', Validators.required],
      complianceItem: ['', Validators.required],
      riskCategory: ['', Validators.required],
    });
  }

  listenIndustryTypeChanges(): void {
    this.form.get('industryTypeId')?.valueChanges.subscribe((industryTypeId) => {
      const parsedId = Number(industryTypeId);
      this.form.patchValue({ complianceCategoryId: '' }, { emitEvent: false });
      this.complianceCategories.set([]);
      if (parsedId > 0) {
        this.getComplianceCategoriesByIndustry(parsedId);
      }
    });
  }

  addComplianceItem(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      industryTypeId: Number(raw.industryTypeId),
      complianceCategoryId: Number(raw.complianceCategoryId),
      complianceItem: raw.complianceItem,
      riskCategory: raw.riskCategory,
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<ComplianceConfig>>(ENDPOINTS.COMPLIANCE_CONFIG.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllComplianceConfigs();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster(
            'Error',
            error.error?.message ?? error.statusText ?? 'Failed to save compliance item.',
          );
        },
        complete: () => (this.isSubmitting = false),
      });
      return;
    }

    if (!this.selectedComplianceConfig?.id) {
      this.isSubmitting = false;
      return;
    }

    this.apiService
      .put<ApiResponse<ComplianceConfig>>(ENDPOINTS.COMPLIANCE_CONFIG.UPDATE(this.selectedComplianceConfig.id), payload)
      .subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Updated successfully.');
          this.getAllComplianceConfigs();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster(
            'Error',
            error.error?.message ?? error.statusText ?? 'Failed to update compliance item.',
          );
        },
        complete: () => (this.isSubmitting = false),
      });
  }

  getIndustryTypes(): void {
    this.apiService.get<ApiResponse<InputDetail[]>>(ENDPOINTS.INPUT_DETAILS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.industryTypes.set(
          list.filter((item) => item.attributeType?.toUpperCase() === 'INDUSTRY_TYPE'),
        );
        this.getAllComplianceCategories();
        this.getAllComplianceConfigs();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to fetch industry types.');
      },
    });
  }

  getComplianceCategoriesByIndustry(industryTypeId: number): void {
    this.apiService
      .get<ApiResponse<ComplianceCategory[]>>(ENDPOINTS.COMPLIANCE_CATEGORIES.BY_INDUSTRY(industryTypeId))
      .subscribe({
        next: (res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          console.log('status',list)
          this.complianceCategories.set(list);
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster(
            'Error',
            error.error?.message ?? error.statusText ?? 'Failed to fetch compliance category list.',
          );
        },
      });
  }

  getAllComplianceCategories(): void {
    this.apiService.get<ApiResponse<ComplianceCategory[]>>(ENDPOINTS.COMPLIANCE_CATEGORIES.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allComplianceCategories.set(list);
      },
      error: () => {
        this.allComplianceCategories.set([]);
      },
    });
  }

  getAllComplianceConfigs(): void {
    this.apiService.get<ApiResponse<ComplianceConfig[]>>(ENDPOINTS.COMPLIANCE_CONFIG.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allComplianceConfigs.set(
          list.map((item, index) => ({
            ...item,
            industryTypeName: item.industryTypeName ?? this.getIndustryTypeName(item.industryTypeId),
            complianceCategoryName: item.complianceCategoryName ?? this.getComplianceCategoryName(item.complianceCategoryId),
            sNumber: index + 1,
          })),
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to fetch compliance items.',
        );
      },
    });
  }

  getIndustryTypeName(industryTypeId: number): string {
    const type = this.industryTypes().find((item) => item.id === industryTypeId);
    return type?.attributeName ?? '-';
  }

  getComplianceCategoryName(complianceCategoryId: number): string {
    const record = this.allComplianceCategories().find((item) => item.id === complianceCategoryId);
    return record?.complianceCategoryName ?? '-';
  }

  edit(item: ComplianceConfig): void {
    this.selectedComplianceConfig = item;
    this.showUpdateButton = true;
    this.getComplianceCategoriesByIndustry(item.industryTypeId);
    this.form.patchValue({
      industryTypeId: item.industryTypeId,
      complianceCategoryId: item.complianceCategoryId,
      complianceItem: item.complianceItem,
      riskCategory: item.riskCategory,
    }, { emitEvent: false });
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedComplianceConfig = null;
    this.form.reset();
    this.complianceCategories.set([]);
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.COMPLIANCE_CONFIG.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllComplianceConfigs();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to delete compliance item.',
        );
      },
    });
  }
}
