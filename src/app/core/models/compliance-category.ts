export interface ComplianceCategory {
  id: number;
  industryTypeId: number;
  complianceCategoryName: string;
  industryTypeName?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sNumber?: number;
  totalOverdue?:number
  totalComplaints?:number
  totalAlert?:number;
 

  complianceConfigs?: ComplianceConfig[];
   totalComplianceTrackers?: number;  
}
export interface ComplianceConfig {
  id?: number;
  complianceCategoryId: number;
  complianceItem: string;

  complianceTrackerStatus?: ComplianceTrackerStatus;
}
export interface ComplianceTrackerStatus {
  complaint: number;
  alert: number;
  overdue: number;
  applied: number;
  notApplied: number;
  total: number;
}