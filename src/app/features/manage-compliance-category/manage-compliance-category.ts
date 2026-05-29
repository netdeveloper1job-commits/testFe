import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { IndusTypeAndComplianceCategory } from './indus-type-and-compliance-category/indus-type-and-compliance-category';
import { Frequency } from './frequency/frequency';
import { Status } from './status/status';
import { Users } from './users/users';
import { Locations } from './locations/locations';
import { ComplianceItems } from './compliance-items/compliance-items';
import { IndustryType } from './industry-type/industry-type';

@Component({
  selector: 'app-manage-compliance-category',
  imports: [NgClass, IndusTypeAndComplianceCategory, Frequency, Status, Users , Locations , ComplianceItems , IndustryType],
  templateUrl: './manage-compliance-category.html',
  styleUrl: './manage-compliance-category.scss',
})
export class ManageComplianceCategory {
  tab: 'indus-type' | 'compliance-category' | 'compliance-items' | 'frequency' | 'status' | 'users' | 'locations' =
    'indus-type';

  ngOnInit(): void {
    this.selectTabs('indus-type');
  }

  selectTabs(type: 'indus-type' | 'compliance-category' | 'compliance-items' | 'frequency' | 'status' | 'users' | 'locations') {
    if (type == 'indus-type') {
      this.tab = 'indus-type';
    } else if (type == 'compliance-category') {
      this.tab = 'compliance-category';
    } else if (type == 'compliance-items') {
      this.tab = 'compliance-items';
    } else if (type == 'frequency') {
      this.tab = 'frequency';
    } else if (type === 'status') {
      this.tab = 'status';
    }
    else if (type == 'users') {
      this.tab = 'users';
    }
    else if (type == 'locations') {
      this.tab = 'locations';
    }
  }
}

