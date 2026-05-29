import { Component } from '@angular/core';
import { columnsModel } from '../../core/models/columnsModel';
import { BootstrapTableComponent } from '../../shared/bootstrap-table/bootstrap-table.component';

@Component({
  selector: 'app-auto-emailer',
  imports: [BootstrapTableComponent],
  templateUrl: './auto-emailer.html',
  styleUrl: './auto-emailer.scss',
})
export class AutoEmailer {
  autoEmailer:any
  bodyTemplate:any

    public columns: Array<columnsModel> = [
      {
        caption: 'S. N',
        dataField: 'sNumber',
        isTemplate: false,
      },
      {
        caption: 'Compliance Item ',
        dataField: 'location',
        isTemplate: false,
        isTooltip: true,
      },
      {
        caption: 'Recipient',
        dataField: 'address',
        isTemplate: false,
        isTooltip: true,
      },
      {
        caption: 'Sent Date ',
        dataField: 'department',
        isTemplate: false,
        isTooltip: true,
      },
      {
        caption: 'Due Date ',
        dataField: 'version',
        isTemplate: false,
        isTooltip: true,
      },
       {
        caption: 'Status',
        dataField: 'version',
        isTemplate: false,
        isTooltip: true,
      },
    ];
}
