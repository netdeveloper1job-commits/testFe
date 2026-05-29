import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarMonthViewDay } from 'angular-calendar';
import { ApiResponse } from '../../core/models/api-response';
import { ENDPOINTS } from '../../core/endpoints';
import { Location as LocationModel } from '../../core/models/location';
import { ApiService } from '../../core/services/api.service';
import { CommonService } from '../../core/services/common.service';
import { FormsModule } from '@angular/forms';

type CalendarComplianceItem = {
  locationId: number | null;
  complianceItemName: string;
  dueDate: string | null;
};

@Component({
  selector: 'app-calender',
  imports: [CommonModule, CalendarModule, FormsModule],
  templateUrl: './calender.html',
  styleUrl: './calender.scss',
})
export class Calender implements OnInit {
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
  ) {}
  allOverDues: CalendarComplianceItem[] = [];
  filteredOverDues: CalendarComplianceItem[] = [];
  selectedLocationId: number | null = null;
  allLocations: Array<LocationModel> = [];
  viewDate = new Date();
  events: CalendarEvent[] = [];

  selectedDate: Date | null = null;

  ngOnInit(): void {
    this.getAllOverDues();
    this.getAllLocations();
  }

  get selectedDateEvents(): CalendarEvent[] {
    if (!this.selectedDate) {
      return [];
    }

    return this.events
      .filter((event) => this.isSameDay(event.start as Date, this.selectedDate as Date))
      .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime());
  }

  get upcomingReminders(): CalendarEvent[] {
    const today = this.startOfDay(new Date());
    const reminderLimit = new Date(today);
    reminderLimit.setDate(reminderLimit.getDate() + 30);

    return this.events
      .filter((event) => {
        const start = this.startOfDay(event.start as Date);
        return start >= today && start <= reminderLimit;
      })
      .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime())
      .slice(0, 7);
  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
  }

  today(): void {
    this.viewDate = new Date();
  }

  onDayClicked(day: CalendarMonthViewDay): void {
    this.selectedDate = day.date;
  }

  onEventClicked(event: CalendarEvent): void {
    this.selectedDate = event.start as Date;
  }

  private isSameDay(first: Date, second: Date): boolean {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  getAllLocations(): void {
    this.apiService.get<ApiResponse<LocationModel[]>>(ENDPOINTS.LOCATIONS.VIEW_ALL).subscribe({
      next: (res) => {
        this.allLocations = res?.data || [];
        this.cdr.detectChanges();
      },
      error: (_error: { error?: { message?: string }; statusText?: string }) => {},
    });
  }

  getAllOverDues(): void {
    this.apiService.get<ApiResponse<any[]>>(ENDPOINTS.COMPLIANCE_TRACKER.VIEW_ALL).subscribe({
      next: (res) => {
        const rawData = Array.isArray(res?.data) ? res.data : [];
        this.allOverDues = rawData
          .map((item, index) => ({
            locationId: item?.locationId ?? item?.location?.id ?? null,
            complianceItemName:
              item?.complianceItemName ??
              item?.complianceConfig?.complianceItem ??
              `Compliance ${index + 1}`,
            dueDate: item?.dueDate ?? null,
          }))
          .filter((item) => this.parseDueDate(item.dueDate) !== null);

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
  applyLocationFilter(): void {
    if (this.selectedLocationId === null) {
      this.filteredOverDues = [...this.allOverDues];
    } else {
      this.filteredOverDues = this.allOverDues.filter(
        (item) => Number(item?.locationId) === this.selectedLocationId,
      );
    }

    this.events = this.filteredOverDues
      .map((item) => this.toCalendarEvent(item))
      .filter((event): event is CalendarEvent => event !== null)
      .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime());

    if (this.selectedDate && !this.selectedDateEvents.length) {
      this.selectedDate = null;
    }
  }

  private toCalendarEvent(item: CalendarComplianceItem): CalendarEvent | null {
    const dueDate = this.parseDueDate(item.dueDate);
    if (!dueDate) {
      return null;
    }

    return {
      start: dueDate,
      title: item.complianceItemName,
      color: this.getEventColor(),
    };
  }

  private parseDueDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return this.startOfDay(date);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

private getEventColor(): { primary: string; secondary: string } {
  return {
    primary: '#e4a900',   // yellow
    secondary: '#fff4ce', // light yellow background
  };
}


}
