import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ENDPOINTS } from '../../core/endpoints';
import { columnsModel } from '../../core/models/columnsModel';
import { ApiResponse } from '../../core/models/api-response';
import { ApiService } from '../../core/services/api.service';
import { CommonService } from '../../core/services/common.service';
import { BootstrapTableComponent } from '../../shared/bootstrap-table/bootstrap-table.component';
import { Location as LocationModel } from '../../core/models/location';

@Component({
  selector: 'app-overdue',
  imports: [CommonModule, FormsModule, BootstrapTableComponent],
  templateUrl: './overdue.html',
  styleUrl: './overdue.scss',
})
export class Overdue implements OnInit {
  allOverDues: any[] = [];
  allLocations: Array<LocationModel> = [];
  filteredOverDues: any[] = [];
  selectedLocationId: number | null = null;
  bodyTemplate: any;

  public columns: Array<columnsModel> = [
    {
      caption: 'S. No',
      dataField: 'sNumber',
      isTemplate: false,
      style: { width: '60px' },
    },
    {
      caption: 'Department',
      dataField: 'department',
      isTemplate: false,
      isTooltip: true,
      style: { width: '150px' },
    },
    {
      caption: 'Responsibility',
      dataField: 'userId',
      isTemplate: false,
      isTooltip: true,
      style: { width: '150px' },
    },
    {
      caption: 'Compliance Item',
      dataField: 'complianceItemName',
      isTemplate: false,
      isTooltip: true,
      style: { width: '200px', maxWidth: '250px' },
    },
    {
      caption: 'Risk Category',
      dataField: 'riskCategory',
      isTemplate: true,
      isTooltip: true,
      style: { width: '120px' },
    },
    {
      caption: 'Location',
      dataField: 'location',
      isTemplate: false,
      isTooltip: true,
      style: { width: '150px' },
    },
    {
      caption: 'Due Date',
      dataField: 'dueDate',
      isTemplate: false,
      isTooltip: true,
      style: { width: '120px' },
    },
    {
      caption: 'Days Overdue',
      dataField: 'daysOverdue',
      isTemplate: true,
      isTooltip: true,
      style: { width: '120px' },
    },
    {
      caption: 'Applied',
      dataField: 'status',
      isTemplate: true,
      isTooltip: true,
      style: { width: '100px' },
    },
  ];

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getAllOverDues();
    this.getAllLocations();
  }

  get totalFormsCount(): number {
    return this.filteredOverDues.length;
  }

  get highRiskCount(): number {
    return this.filteredOverDues.filter(
      (item) => String(item?.riskCategory ?? '').toLowerCase() === 'high',
    ).length;
  }

  get notAppliedCount(): number {
    return this.filteredOverDues.filter(
      (item) => String(item?.status ?? '').toLowerCase() === 'not applied',
    ).length;
  }

  getAllOverDues(): void {
    this.apiService.get<ApiResponse<any[]>>(ENDPOINTS.COMPLIANCE_TRACKER.VIEW_ALL).subscribe({
      next: (res) => {
        const rawData = Array.isArray(res?.data) ? res.data : [];

        this.allOverDues = rawData.map((item, index) => ({
          ...item,
          locationId: item?.locationId ?? item?.location?.id ?? null,
          sNumber: index + 1,
          department:
            item?.complianceConfig?.complianceCategory.complianceCategoryName,
          userId:
            item?.responsibilityName ??
            item?.user?.name ??
            `User ${item?.userId ?? '-'}`,
          complianceItemName:
            item?.complianceItemName ??
            item?.complianceConfig?.complianceItem ??
            `Config ${item?.complianceConfigId ?? '-'}`,
          riskCategory: item?.riskCategory ?? item?.complianceConfig?.riskCategory ?? '-',
          location:
            item?.locationName ??
            item?.location?.location ??
            `Location ${item?.locationId ?? '-'}`,
          dueDate: item?.dueDate ?? '-',
          daysOverdue: this.calculateDays(item?.dueDate),
          status: item?.status ?? item?.applied ?? '-',
        }));

        this.applyLocationFilter();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.allOverDues = [];
        this.filteredOverDues = [];
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to fetch overdue compliance list.',
        );
      },
    });
  }


calculateDays(dueDate: string): number {
  if (!dueDate) return 0;

  const today = new Date();
  const due = new Date(dueDate);

  const diff = today.getTime() - due.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return Math.max(0, days); // 👈 yahan fix
}


  getAllLocations(): void {
    this.apiService.get<ApiResponse<LocationModel[]>>(ENDPOINTS.LOCATIONS.VIEW_ALL).subscribe({
      next: (res) => {
        this.allLocations = res?.data || [];
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
      
      },
    });
  }

  applyLocationFilter(): void {
    if (this.selectedLocationId === null) {
      this.filteredOverDues = [...this.allOverDues];
      return;
    }

    this.filteredOverDues = this.allOverDues.filter(
      (item) => Number(item?.locationId) === this.selectedLocationId,
    );
  }

  getRiskClass(risk: string): string {
  switch ((risk || '').toLowerCase()) {
    case 'high':
      return 'badge-danger';
    case 'medium':
      return 'badge-warning';
    case 'low':
      return 'badge-low';
    default:
      return 'badge-secondary';
  }
}
}
