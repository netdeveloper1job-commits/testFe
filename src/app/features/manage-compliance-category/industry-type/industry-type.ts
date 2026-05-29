import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { columnsModel } from '../../../core/models/columnsModel';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { ENDPOINTS } from '../../../core/endpoints';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { InputDetail } from '../../../core/models/input-detail';
import { ApiResponse } from '../../../core/models/api-response';

@Component({
  selector: 'app-industry-type',
  imports: [CommonModule, ReactiveFormsModule, BootstrapTableComponent],
  templateUrl: './industry-type.html',
  styleUrl: './industry-type.scss',
})
export class IndustryType implements OnInit {
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedIndustryType: InputDetail | null = null;
  allIndustryTypes = signal<InputDetail[]>([]);
  form!: FormGroup;

  public columns: Array<columnsModel> = [
    { caption: 'S. N', dataField: 'sNumber', isTemplate: false },
    { caption: 'Industry Type', dataField: 'attributeName', isTemplate: false, isTooltip: false },
    { caption: 'Action', dataField: 'Action', isTemplate: true },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getAllIndustryTypes();
  }

  createForm(): void {
    this.form = this.fb.group({
      attributeName: ['', Validators.required],
    });
  }

  addIndustryType(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: Record<string, unknown> = {
      attributeType: 'INDUSTRY_TYPE',
      attributeName: this.form.getRawValue().attributeName,
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<InputDetail>>(ENDPOINTS.INPUT_DETAILS.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllIndustryTypes();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to save industry type.');
        },
        complete: () => (this.isSubmitting = false),
      });
      return;
    }

    if (!this.selectedIndustryType?.id) {
      this.isSubmitting = false;
      return;
    }

    this.apiService
      .put<ApiResponse<InputDetail>>(ENDPOINTS.INPUT_DETAILS.UPDATE(this.selectedIndustryType.id), payload)
      .subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Updated successfully.');
          this.getAllIndustryTypes();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to update industry type.');
        },
        complete: () => (this.isSubmitting = false),
      });
  }

  getAllIndustryTypes(): void {
    this.apiService.get<ApiResponse<InputDetail[]>>(ENDPOINTS.INPUT_DETAILS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allIndustryTypes.set(
          list
            .filter((item) => item.attributeType === 'INDUSTRY_TYPE')
            .map((item, index) => ({ ...item, sNumber: index + 1 })),
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to fetch industry type list.',
        );
      },
    });
  }

  edit(item: InputDetail): void {
    this.selectedIndustryType = item;
    this.showUpdateButton = true;
    this.form.patchValue({ attributeName: item.attributeName });
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedIndustryType = null;
    this.form.reset();
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.INPUT_DETAILS.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllIndustryTypes();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to delete industry type.');
      },
    });
  }
}
