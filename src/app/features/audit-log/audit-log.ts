import { Component } from '@angular/core';
import { columnsModel } from '../../core/models/columnsModel';
import { BootstrapTableComponent } from '../../shared/bootstrap-table/bootstrap-table.component';
import { ENDPOINTS } from '../../core/endpoints';
import { ApiService } from '../../core/services/api.service';
import { ApiResponse } from '../../core/models/api-response';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-audit-log',
  imports: [BootstrapTableComponent,CommonModule],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLog {
  constructor( private apiService : ApiService,  private cdr: ChangeDetectorRef){}
  allAuditLogs: any[] = [];
   public columns: Array<columnsModel> = [
      {
        caption: 'S. No.',
        dataField: 'sNumber',
        isTemplate: false,
      },
      {
        caption: 'User Name',
        dataField: 'name',
        isTemplate: true,
        isTooltip: false,
      },
      {
        caption: 'IP Address',
        dataField: 'ipAddress',
        isTemplate: false,
        isTooltip: false,
      },
      {
        caption: 'Device Type',
        dataField: 'deviceType',
        isTemplate: false,
        isTooltip: false,
      },
       {
        caption: 'Login Status',
        dataField: 'loginStatus',
        isTemplate: false,
        isTooltip: false,
      },
       {
        caption: 'Login Time',
        dataField: 'loginTime',
        isTemplate: true,
        isTooltip: false,
      },
       {
        caption: 'Last Menu Accessed',
        dataField: 'actionAccessed',
        isTemplate: false,
        isTooltip: false,
      },
             {
        caption: 'Logout Time',
        dataField: 'logOutTime',
        isTemplate: true,
        isTooltip: false,
      },
    ];

    ngOnInit(){
      this.getAllAuditLogs()
    }

    getAllAuditLogs(): void {
  this.apiService.get<ApiResponse<AuditLog[]>>(ENDPOINTS.AUDIT_LOGS.VIEW_ALL).subscribe({
    next: (res) => {
      this.allAuditLogs = (res?.data || []).map((x: any, i: number) => {
        
        // remove "/" and format text
        const cleanedAction = x.actionAccessed
          ? x.actionAccessed.replace(/\//g, '') // remove all /
          : '';

        return {
          ...x,
          sNumber: i + 1,
          actionAccessed: this.formatMenuName(cleanedAction),
        };
      });

      this.cdr.detectChanges();
    },
    error: () => {}
  });
}

private formatMenuName(value: string): string {
  if (!value) return '';

  return value
    .trim()
    .replace(/-/g, ' ') // optional: kebab-case fix
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
}
