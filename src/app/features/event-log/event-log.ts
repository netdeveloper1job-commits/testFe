import { ChangeDetectorRef, Component } from '@angular/core';
import { BootstrapTableComponent } from '../../shared/bootstrap-table/bootstrap-table.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { columnsModel } from '../../core/models/columnsModel';
import { ApiResponse } from '../../core/models/api-response';
import { AuditLog } from '../audit-log/audit-log';
import { ENDPOINTS } from '../../core/endpoints';

@Component({
  selector: 'app-event-log',
  imports: [BootstrapTableComponent, CommonModule],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
})
export class EventLog {
  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }
  allEventLogs: any[] = [];
  public columns: Array<columnsModel> = [
    {
      caption: 'S. No.',
      dataField: 'sNumber',
      isTemplate: false,
      style: { width: '60px' },
    },
    {
      caption: 'Module Name',
      dataField: 'moduleName',
      isTemplate: false,
      style: { width: '180px', maxWidth: '250px' },
      isTooltip: false,
    },
    {
      caption: 'Event Name',
      dataField: 'eventName',
      isTemplate: false,
      isTooltip: false,
      style: { width: '180px', maxWidth: '250px' },
    },
    {
      caption: 'User Name',
      dataField: 'eventUserName',
      isTemplate: false,
      isTooltip: false,
      style: { width: '150px' },
    },
    {
      caption: 'Old Value',
      dataField: 'oldValue',
      isTemplate: false,
      style: { width: '250px', maxWidth: '250px' },
      isTooltip: true,
    },
    {
      caption: 'New Value',
      dataField: 'newValue',
      isTemplate: false,
      style: { width: '250px', maxWidth: '250px' },
      isTooltip: true,
    },
    {
      caption: 'Event Date & Time',
      dataField: 'eventDateTime',
      isTemplate: true,
      style: { width: '150px', maxWidth: '250px' },
      isTooltip: false,
    },
  ];

  ngOnInit() {
    this.getAllEventLogs()
  }

  private formatKeyValue(value: any): string {
    if (!value) return '';
    let obj: any;
    if (typeof value === 'string') {
      try {
        obj = JSON.parse(value);
      } catch {
        return value;
      }
    } else if (typeof value === 'object') {
      obj = value;
    } else {
      return String(value);
    }
    return Object.entries(obj)
      .filter(([k]) => !['createdBy', 'updatedBy', 'createdAt', 'updatedAt'].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }

  getAllEventLogs(): void {
    this.apiService.get<ApiResponse<EventLog[]>>(ENDPOINTS.EVENT_LOGS.VIEW_ALL).subscribe({
      next: (res) => {
        this.allEventLogs = (res?.data || []).map((x: any, i: number) => {
          return {
            ...x,
            sNumber: i + 1,
            oldValue: this.formatKeyValue(x.oldValue),
            newValue: this.formatKeyValue(x.newValue),
          };
        });
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }
}
