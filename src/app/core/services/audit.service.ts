import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EMPTY, switchMap, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private auditId: number | null = null;

  constructor(private http: HttpClient,) {}

  getDeviceType(): string {
  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

getPublicIP() {
  return this.http.get('https://checkip.amazonaws.com/', {
    responseType: 'text'
  });
}

log(actionAccessed: string, loginStatus: string) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return this.getPublicIP().pipe(
    switchMap((ip: string) => {

      return this.http.post<any>(
        `${environment.api_url}/audit-log/create`,
        {
          user_id: user?.id,
          actionAccessed,
          loginStatus,
          loginTime: new Date(),
          deviceType: this.getDeviceType(),
          ipAddress: ip.trim(),
          logOutTime: null
        }
      );
    }),
    tap((res) => {
      const id = res?.id || res?.audit_id || res?.data?.id;

      if (id) {
        this.setAuditId(id);
      } else {
        console.warn('audit_id not found in response', res);
      }
    })
  );
}

  setAuditId(id: number) {
    this.auditId = id;
    sessionStorage.setItem('auditId', String(id));
    console.log('audit Id' ,this.auditId)
  }

  getAuditId(): number | null {
    const id = sessionStorage.getItem('auditId');
    return id ? Number(id) : this.auditId;
  }


  updateAction(actionAccessed: string) {
    const auditId = this.getAuditId();
    if (!auditId) {
      console.error('Audit ID not found. Create log first.');
      return EMPTY;
    }
    return this.http.patch(
      `${environment.api_url}/audit-log/update/${auditId}`,
      {
        actionAccessed
      }
    );
  }
}