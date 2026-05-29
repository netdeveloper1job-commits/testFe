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

@Component({
  selector: 'app-indus-type-and-compliance-category',
  imports: [CommonModule, ReactiveFormsModule, BootstrapTableComponent],
  templateUrl: './indus-type-and-compliance-category.html',
  styleUrl: './indus-type-and-compliance-category.scss',
})
export class IndusTypeAndComplianceCategory implements OnInit {
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedComplianceCategory: ComplianceCategory | null = null;

  allComplianceCategories = signal<ComplianceCategory[]>([]);
  industryTypes = signal<InputDetail[]>([]);
  form!: FormGroup;

  public columns: Array<columnsModel> = [
    { caption: 'S. N', dataField: 'sNumber', isTemplate: false },
    { caption: 'Industry Type', dataField: 'industryTypeName', isTemplate: false, isTooltip: false },
    { caption: 'Compliance Category', dataField: 'complianceCategoryName', isTemplate: false, isTooltip: false },
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
  }

  createForm(): void {
    this.form = this.fb.group({
      industryTypeId: ['', Validators.required],
      complianceCategoryName: ['', Validators.required],
    });
  }

  addComplianceCategory(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: Record<string, unknown> = {
      industryTypeId: Number(this.form.getRawValue().industryTypeId),
      complianceCategoryName: this.form.getRawValue().complianceCategoryName,
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<ComplianceCategory>>(ENDPOINTS.COMPLIANCE_CATEGORIES.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllComplianceCategories();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster(
            'Error',
            error.error?.message ?? error.statusText ?? 'Failed to save compliance category.',
          );
        },
        complete: () => (this.isSubmitting = false),
      });
      return;
    }

    if (!this.selectedComplianceCategory?.id) {
      this.isSubmitting = false;
      return;
    }

    this.apiService
      .put<ApiResponse<ComplianceCategory>>(ENDPOINTS.COMPLIANCE_CATEGORIES.UPDATE(this.selectedComplianceCategory.id), payload)
      .subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Updated successfully.');
          this.getAllComplianceCategories();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster(
            'Error',
            error.error?.message ?? error.statusText ?? 'Failed to update compliance category.',
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
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to fetch industry types.');
      },
    });
  }

  getAllComplianceCategories(): void {
    this.apiService.get<ApiResponse<ComplianceCategory[]>>(ENDPOINTS.COMPLIANCE_CATEGORIES.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allComplianceCategories.set(
          list.map((item, index) => ({
            ...item,
            industryTypeName: this.getIndustryTypeName(item.industryTypeId),
            sNumber: index + 1,
          })) as ComplianceCategory[],
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to fetch compliance categories.',
        );
      },
    });
  }

  getIndustryTypeName(industryTypeId: number): string {
    const type = this.industryTypes().find((item) => item.id === industryTypeId);
    return type?.attributeName ?? '-';
  }

  edit(item: ComplianceCategory): void {
    this.selectedComplianceCategory = item;
    this.showUpdateButton = true;
    this.form.patchValue({
      industryTypeId: item.industryTypeId,
      complianceCategoryName: item.complianceCategoryName,
    });
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedComplianceCategory = null;
    this.form.reset();
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.COMPLIANCE_CATEGORIES.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllComplianceCategories();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to delete compliance category.',
        );
      },
    });
  }
}
