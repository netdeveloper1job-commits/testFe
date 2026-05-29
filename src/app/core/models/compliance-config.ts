export interface ComplianceConfig {
  id: number;
  industryTypeId: number;
  complianceCategoryId: number;
  complianceItem: string;
  riskCategory: string;
  industryTypeName?: string;
  complianceCategoryName?: string;
  sNumber?: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
