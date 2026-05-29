import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Location as LocationModel } from '../../../core/models/location';

import { Router } from '@angular/router';
import { BootstrapTableComponent } from '../../../shared/bootstrap-table/bootstrap-table.component';
import { columnsModel } from '../../../core/models/columnsModel';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';
import { ApiResponse } from '../../../core/models/api-response';
import { ENDPOINTS } from '../../../core/endpoints';

@Component({
  selector: 'app-location',
  imports: [CommonModule, BootstrapTableComponent],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class Location implements OnInit {
  bodyTemplate: any;
  @Input() viewMode: 'tile' | 'detailed' = 'tile';
  allLocations: Array<LocationModel> = []

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
      caption: 'Total Over Due Compliance',
      dataField: 'department',
      isTemplate: false,
      isTooltip: false,
    },
    {
      caption: 'Total Alert',
      dataField: 'version',
      isTemplate: false,
      isTooltip: false,
    },
  ];

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllLocations();
  }

  getAllLocations(): void {
    this.apiService.get<ApiResponse<LocationModel[]>>(ENDPOINTS.LOCATIONS.VIEW_ALL).subscribe({
      next: (res) => {
        this.allLocations = res?.data || []

        this.allLocations.forEach((x, i) => {
          x.sNumber = i + 1;
        });
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string }; statusText?: string }) => {

      },
    });
  }



  setViewMode(mode: 'tile' | 'detailed'): void {
    this.viewMode = mode;
  }
  trackByIndex(index: number): number {
    return index;
  }
  openLocationDetails(item: any) {
    this.router.navigate(['/location'], {
      queryParams: {
        industryTypeId: Number(item.industryTypeId),
        locationName: item?.location ?? '',
        locationId: item.id
      },
    });
  }
}
