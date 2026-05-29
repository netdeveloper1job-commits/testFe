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
  selector: 'app-status',
  imports: [CommonModule, ReactiveFormsModule, BootstrapTableComponent],
  templateUrl: './status.html',
  styleUrl: './status.scss',
})
export class Status implements OnInit {
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedStatus: InputDetail | null = null;
  allStatuses = signal<InputDetail[]>([]);
  form!: FormGroup;

  public columns: Array<columnsModel> = [
    { caption: 'S. N', dataField: 'sNumber', isTemplate: false },
    { caption: 'Status', dataField: 'attributeName', isTemplate: false, isTooltip: false },
    { caption: 'Action', dataField: 'Action', isTemplate: true },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getAllStatuses();
  }

  createForm(): void {
    this.form = this.fb.group({
      attributeName: ['', Validators.required],
    });
  }

  addStatus(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const payload: Record<string, unknown> = {
      attributeType: 'STATUS',
      attributeName: this.form.getRawValue().attributeName,
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<InputDetail>>(ENDPOINTS.INPUT_DETAILS.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllStatuses();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to save status.');
        },
        complete: () => (this.isSubmitting = false),
      });
      return;
    }

    if (!this.selectedStatus?.id) {
      this.isSubmitting = false;
      return;
    }

    this.apiService.put<ApiResponse<InputDetail>>(ENDPOINTS.INPUT_DETAILS.UPDATE(this.selectedStatus.id), payload).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Updated successfully.');
        this.getAllStatuses();
        this.cancel();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to update status.');
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  getAllStatuses(): void {
    this.apiService.get<ApiResponse<InputDetail[]>>(ENDPOINTS.INPUT_DETAILS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allStatuses.set(
          list
            .filter((item) => item.attributeType === 'STATUS')
            .map((item, index) => ({ ...item, sNumber: index + 1 })),
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to fetch status list.');
      },
    });
  }

  edit(item: InputDetail): void {
    this.selectedStatus = item;
    this.showUpdateButton = true;
    this.form.patchValue({ attributeName: item.attributeName });
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedStatus = null;
    this.form.reset();
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.INPUT_DETAILS.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllStatuses();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to delete status.');
      },
    });
  }
}
