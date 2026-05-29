import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../core/models/api-response';
import { ComplianceCategory } from '../../core/models/compliance-category';
import { ENDPOINTS } from '../../core/endpoints';
import { Location as LocationModel } from '../../core/models/location';
import { User } from '../../core/models/users';
import { CommonService } from '../../core/services/common.service';
import { ApiService } from '../../core/services/api.service';

// Import Chart.js
import { Chart, registerables } from 'chart.js';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
Chart.register(...registerables);

type DashboardTrackerItem = {
  locationId: number | null;
  dueDate: string | null;
  responsibilityName: string;
  categoryName: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule , RouterLinkActive , RouterModule , RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  allLocations: LocationModel[] = [];
  allUsers: User[] = [];
  allComplianceCategories: ComplianceCategory[] = [];
  allTrackers: DashboardTrackerItem[] = [];
  filteredTrackers: DashboardTrackerItem[] = [];
  selectedLocationId: number | null = null;

  private complianceChart: Chart | undefined;
  private complianceDonutChart: Chart | undefined;

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getAllLocations();
    this.getAllUsers();
    this.getAllComplianceCategories();
    this.getAllComplianceTrackers();
  }

  ngOnDestroy(): void {
    if (this.complianceChart) {
      this.complianceChart.destroy();
    }
    if (this.complianceDonutChart) {
      this.complianceDonutChart.destroy();
    }
  }

  // =========================
  // GETTERS
  // =========================

  get currentLocationLabel(): string {
    if (this.selectedLocationId === null) return 'All locations';
    return this.allLocations.find((l) => l.id === this.selectedLocationId)?.location ?? 'Selected location';
  }

  get displayedLocationCount(): number {
    return this.selectedLocationId === null ? this.allLocations.length : 1;
  }

  get displayedUsersCount(): number {
    return this.selectedLocationId === null 
      ? this.allUsers.length 
      : new Set(this.filteredTrackers.map((t) => t.responsibilityName).filter(Boolean)).size;
  }

  get displayedCategoryCount(): number {
    return this.selectedLocationId === null 
      ? this.allComplianceCategories.length 
      : new Set(this.filteredTrackers.map((t) => t.categoryName).filter(Boolean)).size;
  }

  get totalCompliancesCount(): number { return this.filteredTrackers.length; }

  get complianceAlertCount(): number {
    return this.filteredTrackers.filter((t) => this.getComplianceStatus(t.dueDate) === 'alert').length;
  }

  get overdueComplianceCount(): number {
    return this.filteredTrackers.filter((t) => this.getComplianceStatus(t.dueDate) === 'overdue').length;
  }

  // =========================
  // CHART LOGIC
  // =========================

private initBarChart(): void {
  const ctx = document.getElementById('complianceBarChart') as HTMLCanvasElement;
  if (!ctx) return;

  if (this.complianceChart) {
    this.complianceChart.destroy();
  }

  // --- START: GREY BG PLUGIN ---
const hoverBackgroundPlugin = {
  id: 'hoverBackground',
  beforeDraw: (chart: any) => {
    if (chart.tooltip?._active?.length) {
      const { ctx, chartArea: { top, bottom, left, right }, scales: { x } } = chart;
      const activePoint = chart.tooltip._active[0];
      const index = activePoint.index;
      
      const count = chart.data.labels.length;
      const categoryWidth = (right - left) / count; 
      const xPos = x.getPixelForValue(index);

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      
      // CHANGE HERE: Increasing 0.9 to 0.98 or 1.0 reduces the space between the grey highlights
      const highlightWidth = categoryWidth * 0.98; 
      
      ctx.fillRect(xPos - highlightWidth / 2, top, highlightWidth, bottom - top);
      ctx.restore();
    }
  }
};
  // --- END: GREY BG PLUGIN ---

  const labels = this.allComplianceCategories.map(cat => cat.complianceCategoryName);
  const allValues = this.allComplianceCategories.flatMap(cat => [
    (cat.totalComplianceTrackers || 0),
    (cat.totalAlert || 0),
    (cat.totalOverdue || 0)
  ]);
  const maxVal = Math.max(...allValues, 1);
    
    this.complianceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
    {
      label: 'Compliant',
      data: this.allComplianceCategories.map(cat => 
              Math.max((cat.totalComplianceTrackers || 0) - (cat.totalAlert || 0) - (cat.totalOverdue || 0), 0)
            ),
      backgroundColor: '#2ecc71',
      barThickness: 15,
      // --- MATCH IMAGE SPACING ---
      categoryPercentage: 0.85, // Controls the gap between departments (HR, Ops, etc.)
      barPercentage: 0.9        // Controls the gap between the 3 colored bars inside the group
    },
    {
      label: 'Alert',
      data: this.allComplianceCategories.map(cat => cat.totalAlert || 0),
      backgroundColor: '#f1c40f',
      borderRadius: 2,
      barThickness: 15,
      categoryPercentage: 0.85, // Keep consistent across all datasets
      barPercentage: 0.9
    },
    {
      label: 'Overdue',
        data: this.allComplianceCategories.map(cat => cat.totalOverdue || 0),
      backgroundColor: '#e74c3c',
      barThickness: 15,
      categoryPercentage: 0.85,
      barPercentage: 0.9
    }
  ]
      
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // --- ADDED FOR GREY BG TRIGGER ---
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          displayColors: true
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { padding: 8 } // Space between labels and bars
        },
        y: { 
          beginAtZero: true, 
          suggestedMax: maxVal + 1, 
          ticks: { stepSize: 1 } 
        }
      }
    },
    plugins: [hoverBackgroundPlugin] // --- REGISTERED PLUGIN ---
  });
}

private initDonutChart(): void {
  const totalCompliant = this.allComplianceCategories.reduce((sum, cat) => sum + Math.max((cat.totalComplianceTrackers || 0) - (cat.totalAlert || 0) - (cat.totalOverdue || 0), 0), 0);
  const totalAlert = this.allComplianceCategories.reduce((sum, cat) => sum + (cat.totalAlert || 0), 0);
  const totalOverdue = this.allComplianceCategories.reduce((sum, cat) => sum + (cat.totalOverdue || 0), 0);
  const total = totalCompliant + totalAlert + totalOverdue;



  const ctx = document.getElementById('complianceDonutChart') as HTMLCanvasElement;
  if (!ctx) return;

  if (this.complianceDonutChart) {
    this.complianceDonutChart.destroy();
  }

  this.complianceDonutChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Compliant', 'Alert', 'Overdue'],
      datasets: [{
        data: [totalCompliant, totalAlert, totalOverdue],
        backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed;
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${context.label}: ${value} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

  // =========================
  // API CALLS
  // =========================

  getAllLocations(): void {
    this.apiService.get<ApiResponse<LocationModel[]>>(ENDPOINTS.LOCATIONS.VIEW_ALL).subscribe({
      next: (res) => {
        this.allLocations = res?.data || [];
        this.cdr.detectChanges();
      },
      error: () => (this.allLocations = []),
    });
  }

  getAllUsers(): void {
    this.apiService.get<ApiResponse<User[]>>(ENDPOINTS.USERS.VIEW_ALL).subscribe({
      next: (res) => {
        this.allUsers = res?.data || [];
        this.cdr.detectChanges();
      },
      error: () => (this.allUsers = []),
    });
  }

  getAllComplianceCategories(): void {
    this.apiService
      .get<ApiResponse<ComplianceCategory[]>>(ENDPOINTS.COMPLIANCE_CATEGORIES.VIEW_ALL)
      .subscribe({
        next: (res) => {
          this.allComplianceCategories = res?.data || [];
          // Trigger chart render after data is loaded
          setTimeout(() => {
            this.initBarChart();
            this.initDonutChart();
          }, 0);
          this.cdr.detectChanges();
        },
        error: () => (this.allComplianceCategories = []),
      });
  }

  getAllComplianceTrackers(): void {
    this.apiService.get<ApiResponse<any[]>>(ENDPOINTS.COMPLIANCE_TRACKER.VIEW_ALL).subscribe({
      next: (res) => {
        const rawData = Array.isArray(res?.data) ? res.data : [];
        this.allTrackers = rawData.map((item) => ({
          locationId: item?.locationId ?? item?.location?.id ?? null,
          dueDate: item?.dueDate ?? null,
          responsibilityName: item?.user?.name ?? `User ${item?.userId ?? '-'}`,
          categoryName: item?.complianceConfig?.complianceCategory?.complianceCategoryName ?? 'Uncategorized',
        }));
        this.applyLocationFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.allTrackers = [];
        this.commonService.showtoaster('Error', 'Failed to fetch dashboard data.');
      },
    });
  }

  applyLocationFilter(): void {
    this.filteredTrackers = this.selectedLocationId === null
      ? [...this.allTrackers]
      : this.allTrackers.filter((t) => Number(t.locationId) === this.selectedLocationId);
    
    // If you want the chart to filter by location too, you would need 
    // a different API or client-side grouping logic here.
  }

  private getComplianceStatus(dueDate: string | null): 'alert' | 'overdue' | 'compliant' {
    if (!dueDate) return 'compliant';
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) return 'compliant';

    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const due = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    const alertLimit = new Date(currentDate);
    alertLimit.setDate(alertLimit.getDate() + 30);

    if (due < currentDate) return 'overdue';
    if (due <= alertLimit) return 'alert';
    return 'compliant';
  }
}