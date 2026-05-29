import { Component, Input, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { ENDPOINTS } from '../../../core/endpoints';
import { ApiService } from '../../../core/services/api.service';
import { ComplianceCategory } from '../../../core/models/compliance-category';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { columnsModel } from '../../../core/models/columnsModel';

@Component({
  selector: 'app-location-details',
  imports: [CommonModule, BootstrapTableComponent],
  templateUrl: './location-details.html',
  styleUrl: './location-details.scss',
})
export class LocationDetails implements OnInit, OnChanges {
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  @Input() industryId?: number;
  @Input() industryName = '';
  @Input() viewMode: 'tile' | 'detailed' = 'tile';
  categories = signal<ComplianceCategory[]>([]);
  resolvedIndustryId = 0;
  bodyTemplate: any
  public columns: Array<columnsModel> = [
    {
      caption: 'S. N',
      dataField: 'sNumber',
      isTemplate: false,
    },
    {
      caption: 'industry',
      dataField: 'industry',
      isTemplate: true,
      isTooltip: false,
    },
    {
      caption: 'complianceCategoryName',
      dataField: 'complianceCategoryName',
      isTemplate: false,
      isTooltip: false,
    },
  ];
  ngOnInit() {
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['industryId'] && !changes['industryId'].firstChange) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    const routeId = this.route.snapshot.paramMap.get('industryTypeId');
    const stateIndustryName = history.state.industryName;

    this.resolvedIndustryId = this.industryId ?? (routeId ? Number(routeId) : 0);
    if (!this.industryName && stateIndustryName) {
      this.industryName = stateIndustryName;
    }

    if (!this.resolvedIndustryId) {
      this.categories.set([]);
      return;
    }

    this.getCategories(this.resolvedIndustryId);
  }

  getCategories(industryId: number) {
    this.apiService
      .get<any>(ENDPOINTS.COMPLIANCE_CATEGORIES.BY_INDUSTRY(industryId))
      .subscribe({
        next: (res) => {
          const list = (res.data || []).map((item: any, index: number) => ({
            ...item,
            sNumber: index + 1,
          }));
          this.categories.set(list || []);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  trackByIndex(index: number): number {
    return index;
  }

  openComplianceTracker(item: ComplianceCategory): void {
    this.router.navigate(['/location'], {
      queryParamsHandling: 'merge',
      queryParams: {
        complianceCategoryId: item.id,
        complianceCategoryName: item.complianceCategoryName ?? '',
        tracker: 'true',
      },
    });
  }
}
