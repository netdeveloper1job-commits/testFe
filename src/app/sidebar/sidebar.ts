import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, effect, EventEmitter, Input, Output } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../core/services/auth.service";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar {
  constructor(
    private auth: AuthService,
    public router: Router,
    private http: HttpClient,
  ) { }
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  userDetails = JSON.parse(localStorage.getItem('user') ?? '');

  logOut() {
    this.updateLogoutTime().subscribe({
      next: () => {
        this.auth.logout();
      },
      error: (err: any) => {
        console.error('Logout time update failed', err);
        this.auth.logout();
      }
    });
  }

  updateLogoutTime() {
    const auditId = sessionStorage.getItem('auditId');
    console.log('============', auditId)
    return this.http.patch(
      `${environment.api_url}/audit-log/update/${auditId}`,
      {
        logOutTime: new Date()
      }
    );
  }
  openAuditLog() {
    const password = prompt('Enter password to open Audit Log');
    if (password === null) {
      return;
    }
    if (password.trim() === '') {
      alert('Password required');
      return;
    }
    if (password !== 'admin123') {
      alert('Incorrect password');
      return;
    }
    this.router.navigate(['/audit-log']);
  }
}
