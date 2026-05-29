export interface GrandTotals {
  totalCategories: number;
  totalTrackers: number;
  totalComplaints: number;
  totalOverdue: number;
  totalAlert: number;
}

export interface Location {
  id: number;
  location: string;
  address: string;
  sNumber:number;
  industryTypeId?: any;
  grandTotals?: GrandTotals;
}