export interface AuditLog {
  id?: number;
  user_id: number;
  loginTime?: Date;
  status: string;
  ipAddress?: string;
  deviceType?: string;
  action: string;
  createdAt?: Date;
  updatedAt?: Date;
}