import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-bootstrap-table',
  standalone: true,
  imports: [CommonModule,NgxPaginationModule,TooltipModule],
  templateUrl: './bootstrap-table.component.html',
  styleUrl: './bootstrap-table.component.scss'
})
export class BootstrapTableComponent {
  @Input() dataSource: any = [];
  @Input() columns: any = [];
  @Input() bodyTemplate: any;
  @Input() theme: string = '';
  @Input() headerTemplate: any;
  @Input() pagination: boolean = false;
  @Input() sales: boolean = false;
  @Input() visible?: boolean | Function;

  paginationConfig = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: this.dataSource?.length ?? 0,
  };

  ngOnChanges() {
    this.paginationConfig = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.dataSource?.length ?? 0,
    };
  }

  pageChanged(event: any) {
    this.paginationConfig.currentPage = event;
  }
  shouldHighlightRow(index: number): boolean {
    const visibleIndex = Math.floor(index / 2) + 1;
    return visibleIndex % 2 === 0; // Return true for every 2nd visible index
  }

  getType(column:any):string{
   return typeof column.style;
  }

  get visibleColumns() {
    return this.columns.filter((column: any) => {
      if (column.visible === undefined) return true;
      if (typeof column.visible === 'function') {
        return column.visible();
      }
      return column.visible !== false;
    });
  }
}
