import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { columnsModel } from '../../../core/models/columnsModel';
import { ENDPOINTS } from '../../../core/endpoints';
import { Location } from '../../../core/models/location';
import { ApiResponse } from '../../../core/models/api-response';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { InputDetail } from '../../../core/models/input-detail';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, ReactiveFormsModule, BootstrapTableComponent],
  templateUrl: './locations.html',
  styleUrl: './locations.scss',
})
export class Locations implements OnInit {
  submitted = false;
  showUpdateButton = false;
  isSubmitting = false;
  selectedLocation: Location | null = null;
  allLocations = signal<Location[]>([]);
  allIndustryTypes = signal<InputDetail[]>([]);
  industryTypes = signal<InputDetail[]>([]);
  form!: FormGroup;

  public columns: Array<columnsModel> = [
    {
      caption: 'S. N',
      dataField: 'sNumber',
      isTemplate: false,
    },
    {
      caption: 'Location',
      dataField: 'location',
      isTemplate: false,
      isTooltip: false,
    },
    {
      caption: 'Address',
      dataField: 'address',
      isTemplate: false,
      isTooltip: false,
    },
    {
      caption: 'Industry Type',
      dataField: 'industryTypeId',
      isTemplate: true,
      isTooltip: false,
    },
    {
      caption: 'Action',
      dataField: 'Action',
      isTemplate: true,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.getAllLocations();
    this.getAllIndustryTypes();
    this.createForm();
  }

  createForm(): void {
    this.form = this.fb.group({
      location: ['', Validators.required],
      address: ['', Validators.required],
      industryTypeId: ['', Validators.required],
    });
  }

  addLocation(type: 'create' | 'update'): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      location: formValue.location,
      address: formValue.address,
      industryTypeId: formValue.industryTypeId,
    };

    this.isSubmitting = true;

    if (type === 'create') {
      this.apiService.post<ApiResponse<Location>>(ENDPOINTS.LOCATIONS.CREATE, payload).subscribe({
        next: () => {
          this.commonService.showtoaster('Success', 'Saved successfully.');
          this.getAllLocations();
          this.cancel();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to save location.');
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
      return;
    }

    if (!this.selectedLocation?.id) {
      this.isSubmitting = false;
      return;
    }

    this.apiService.put<ApiResponse<Location>>(ENDPOINTS.LOCATIONS.UPDATE(this.selectedLocation.id), payload).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Updated successfully.');
        this.getAllLocations();
        this.cancel();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to update location.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  getAllLocations(): void {
    this.apiService.get<ApiResponse<Location[]>>(ENDPOINTS.LOCATIONS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.allLocations.set(
          list.map((location, index) => ({
            ...location,
            sNumber: index + 1,
          })),
        );
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to fetch locations.');
      },
    });
  }

  edit(item: Location): void {
    this.selectedLocation = item;
    this.showUpdateButton = true;

    this.form.patchValue({
      location: item.location,
      address: item.address,
      industryTypeId: item.industryTypeId,
    });
  }

  cancel(): void {
    this.submitted = false;
    this.showUpdateButton = false;
    this.selectedLocation = null;
    this.form.reset();
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.LOCATIONS.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllLocations();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster('Error', error.error?.message ?? error.statusText ?? 'Failed to delete location.');
      },
    });
  }


  getAllIndustryTypes(): void {
    this.apiService.get<ApiResponse<InputDetail[]>>(ENDPOINTS.INPUT_DETAILS.VIEW_ALL).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];

        const filtered = list.filter(
          (item) => item.attributeType === 'INDUSTRY_TYPE'
        );

        this.allIndustryTypes.set(filtered);
        this.industryTypes.set(filtered); // ✅ ADD THIS
      },
      error: (error) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to fetch industry type list.'
        );
      },
    });
  }
}
