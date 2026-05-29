import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Location } from './location/location';
import { ManageComplianceItems } from './manage-compliance-items/manage-compliance-items';
import { LocationDetails } from './location-details/location-details';
import { LocationComplianceTracker } from './location-compliance-tracker/location-compliance-tracker';

@Component({
  selector: 'app-location-drilldown',
  imports: [CommonModule, Location, LocationDetails, LocationComplianceTracker],
  templateUrl: './location-drilldown.html',
  styleUrl: './location-drilldown.scss',
})
export class LocationDrilldown implements OnInit, AfterViewInit {
  @ViewChild(LocationComplianceTracker) complianceTrackerComponent?: LocationComplianceTracker;

  viewMode: 'tile' | 'detailed' = 'tile';
  selectedIndustryId: number | null = null;
  selectedLocationId: number | null = null;
  selectedComplianceCategoryId: number | null = null;
  selectedIndustryName = '';
  selectedLocationName = '';
  selectedComplianceCategoryName = '';
  showComplianceTracker = false;
  modalRef!: BsModalRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
  ) {}

  ngAfterViewInit(): void {
    this.refreshComplianceTracker();
  }

  ngOnInit(): void {
    this.viewMode = 'tile';
    this.route.queryParamMap.subscribe((params) => {
      const industryTypeId = params.get('industryTypeId');
      const locationId = params.get('locationId');
      const complianceCategoryId = params.get('complianceCategoryId');
      this.selectedIndustryId = industryTypeId ? Number(industryTypeId) : null;
      this.selectedLocationId = locationId ? Number(locationId) : null;
      this.selectedComplianceCategoryId = complianceCategoryId ? Number(complianceCategoryId) : null;
      this.selectedIndustryName = params.get('industryName') ?? '';
      this.selectedLocationName = params.get('locationName') ?? '';
      this.selectedComplianceCategoryName = params.get('complianceCategoryName') ?? '';
      this.showComplianceTracker = params.get('tracker') === 'true';
      this.refreshComplianceTracker();
    });
  }

setViewMode(mode: 'tile' | 'detailed'): void {
  this.viewMode = mode;
}

  openManageComplianceModal(trackerRecord?: any): void {
    this.modalRef = this.modalService.show(ManageComplianceItems, {
      backdrop: 'static',
      class: 'modal-lg',
      initialState: {
        locationId: this.selectedLocationId,
        locationName: this.selectedLocationName,
        complianceCategoryId: this.selectedComplianceCategoryId,
        trackerRecord,
      },
    });

    this.modalRef.onHide?.subscribe(() => {
      this.refreshComplianceTracker();
    });
  }

  refreshComplianceTracker(): void {
    setTimeout(() => {
      if (this.showComplianceTracker) {
        this.complianceTrackerComponent?.getAllComplianceTrackers();
      }
    });
  }

  backToLocations(): void {
    this.selectedIndustryId = null;
    this.selectedLocationId = null;
    this.selectedIndustryName = '';
    this.selectedLocationName = '';
    this.router.navigate(['/loc'], { replaceUrl: true });
  }

  backToAllLocations(): void {
    this.router.navigate(['/location'], {
      queryParams: {},
    });
  }

  backToLocationCategories(): void {
    if (!this.selectedIndustryId || !this.selectedLocationId) {
      return;
    }

    this.router.navigate(['/location'], {
      queryParams: {
        industryTypeId: this.selectedIndustryId,
        locationId: this.selectedLocationId,
        industryName: this.selectedIndustryName,
        locationName: this.selectedLocationName,
      },
    });
  }
}
