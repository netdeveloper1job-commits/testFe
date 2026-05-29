export interface EventLog {
  id?: number;
  moduleName: string;
  eventName: string;
  oldValue?: string;
  newValue?: string;
  eventPrimeryKey: number | string;
  eventUserId: number | string;
  eventUserName: string;
  eventDateTime: Date | string;
}