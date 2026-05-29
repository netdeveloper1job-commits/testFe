import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { columnsModel } from '../../../core/models/columnsModel';
import { ApiResponse } from '../../../core/models/api-response';
import { ENDPOINTS } from '../../../core/endpoints';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-location-compliance-tracker',
  imports: [CommonModule, BootstrapTableComponent],
  templateUrl: './location-compliance-tracker.html',
  styleUrl: './location-compliance-tracker.scss',
})
export class LocationComplianceTracker implements OnInit {

  @Input() locationId: number | null = null;
  @Input() complianceCategoryId: number | null = null;
  @Output() editTracker = new EventEmitter<any>();
  @ViewChild('bodyTemplate', { static: true }) bodyTemplate!: TemplateRef<any>;
  // bodyTemplate: any;
  locationName = ''
  dataSource: any[] = [];
  categoryName = '';
  env = environment.api_url;
  public columns: Array<columnsModel> = [
    {
      caption: 'S. N',
      dataField: 'sNumber',
      isTemplate: false,
      style: { width: '60px' },
    },
    {
      caption: 'Compliance Item',
      dataField: 'complianceItemName',
      isTemplate: true,
      isTooltip: false,
      style: { width: '200px', maxWidth: '250px' },
    },
    {
      caption: 'Due Date',
      dataField: 'dueDate',
      isTemplate: true,
      isTooltip: false,
      style: { width: '120px' },
    },
    {
      caption: 'Risk Category',
      dataField: 'riskCategory',
      isTemplate: true,
      isTooltip: false,
      style: { width: '120px' },
    },
    {
      caption: 'Responsibility',
      dataField: 'responsibilityName',
      isTemplate: true,
      isTooltip: false,
      style: { width: '150px' },
    },
    {
      caption: 'Compliance  Certificate',
      dataField: 'certificateURL',
      isTemplate: true,
      isTooltip: true,
      style: { width: '150px' },
    },
    {
      caption: 'Action',
      dataField: 'activity',
      isTemplate: true,
      isTooltip: false,
      style: { width: '100px' },
    },
    {
      caption: 'Status',
      dataField: 'status',
      isTemplate: true,
      isTooltip: false,
      style: { width: '100px' },
    },
    {
      caption: 'Doc',
      dataField: 'doc',
      isTemplate: true,
      isTooltip: false,
      style: { width: '80px' },
    },
    {
      caption: 'Action',
      dataField: 'Action',
      isTemplate: true,
      isTooltip: false,
      style: { width: '100px' },
    },
  ];

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryName = params['complianceCategoryName'] || '';
      this.locationName = params['locationName'] || ''
    });

    this.getAllComplianceTrackers();
  }

  getAllComplianceTrackers(): void {
    if (!this.complianceCategoryId) {
      this.dataSource = [];
      return;
    }



    this.apiService
      .get<ApiResponse<any[]>>(
        ENDPOINTS.COMPLIANCE_TRACKER.BY_COMPLIANCE_CATEGORY(this.complianceCategoryId),
      )
      .subscribe({
        next: (res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          this.dataSource = list
          this.dataSource.forEach(
            (x: { sNumber: number }, i: number) => (x.sNumber = i + 1)
          );
          this.cdr.detectChanges();
        },
        error: (error: { error?: { message?: string }; statusText?: string }) => {
          this.dataSource = [];
          this.commonService.showtoaster(
            'Error',
            error.error?.message ?? error.statusText ?? 'Failed to fetch compliance tracker list.',
          );
        },
      });
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-GB');
  }

  edit(item: any): void {
    this.editTracker.emit(item);
  }

  delete(id: number): void {
    this.apiService.delete<ApiResponse<null>>(ENDPOINTS.COMPLIANCE_TRACKER.DELETE(id)).subscribe({
      next: () => {
        this.commonService.showtoaster('Success', 'Delete successfully.');
        this.getAllComplianceTrackers();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {
        this.commonService.showtoaster(
          'Error',
          error.error?.message ?? error.statusText ?? 'Failed to delete compliance tracker.',
        );
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the category ID changes, fetch new data
    if (changes['complianceCategoryId'] && !changes['complianceCategoryId'].firstChange) {
      this.getAllComplianceTrackers();
    }
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

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'overdue':
        return 'badge-danger';
      case 'alert':
        return 'badge-warning';
      case 'applied':
        return 'badge-success';
      case 'in process':
        return 'badge-success';  
      case 'not applied':
        return 'badge-secondary';
      case 'compliant':
        return 'badge-info';
      case 'compliance':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }
}
