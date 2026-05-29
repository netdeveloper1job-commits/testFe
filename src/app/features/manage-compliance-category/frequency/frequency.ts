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
  selector: 'app-frequency',
  imports: [CommonModule, ReactiveFormsModule, BootstrapTableComponent],
  templateUrl: './frequency.html',
  styleUrl: './frequency.scss',
})
export class Frequency implements OnInit {
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedFrequency: InputDetail | null = null;
  allFrequencies = signal<InputDetail[]>([]);
  form!: FormGroup;

  public columns: Array<columnsModel> = [
    { caption: 'S. N', dataField: 'sNumber', isTemplate: false },
    { caption: 'Frequency', dataField: 'attributeName', isTemplate: false, isTooltip: false },
    { caption: 'Action', dataField: 'Action', isTemplate: true },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getAllFrequencies();
  }

  createForm(): void {
    this.form = this.fb.group({
      attributeName: ['', Validators.required],
    });
  }

  addFrequency(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: Record<string, unknown> = {
      attributeType: 'FREQUENCY',
      attributeName: this.form.getRawValue().attributeName,
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<InputDetail>>(ENDPOINTS.INPUT_DETAILS.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllFrequencies();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to save frequency.');
        },
        complete: () => (this.isSubmitting = false),
      });
      return;
    }

    if (!this.selectedFrequency?.id) {
      this.isSubmitting = false;
      return;
    }

    this.apiService.put<ApiResponse<InputDetail>>(ENDPOINTS.INPUT_DETAILS.UPDATE(this.selectedFrequency.id), payload).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Updated successfully.');
        this.getAllFrequencies();
        this.cancel();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to update frequency.');
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  getAllFrequencies(): void {
    this.apiService.get<ApiResponse<InputDetail[]>>(ENDPOINTS.INPUT_DETAILS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allFrequencies.set(
          list
            .filter((item) => item.attributeType === 'FREQUENCY')
            .map((item, index) => ({ ...item, sNumber: index + 1 })),
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to fetch frequency list.');
      },
    });
  }

  edit(item: InputDetail): void {
    this.selectedFrequency = item;
    this.showUpdateButton = true;
    this.form.patchValue({ attributeName: item.attributeName });
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedFrequency = null;
    this.form.reset();
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.INPUT_DETAILS.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllFrequencies();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to delete frequency.');
      },
    });
  }
}
