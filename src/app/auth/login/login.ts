import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from '../../core/endpoints';
import { CommonService } from '../../core/services/common.service';
import { AuditService } from '../../core/services/audit.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {

  form!: FormGroup;
  intervalId: any;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private commonService: CommonService,
    private audit: AuditService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      username: [''],
      password: [''],
    });

    this.checkSession();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // LOGIN ONLY PLACE AUDIT HAPPENS
  login() {
    const payload = this.form.value;
    this.http.post<any>(
      `${environment.api_url}${ENDPOINTS.LOGIN}`,
      payload
    ).subscribe({
      next: (res) => {
        if (res?.user) {
          this.setSession(res);
          this.audit.log('LOGIN', 'SUCCESS').subscribe();
          this.router.navigate(['/dashboard']);
        } else {
          this.audit.log('LOGIN', 'FAILED').subscribe();
          this.commonService.showtoaster('Error', 'Invalid credentials');
        }
      },
      error: (err) => {
        this.audit.log('LOGIN', 'FAILED').subscribe();
        const message =
          err?.error?.message ||
          err?.error?.error ||
          'Invalid credentials';
        this.commonService.showtoaster('Error', message);
        console.log('loginnnnnnnnnn', message)
      }
    });
  }

  setSession(res: any) {
    const expiryTime = new Date().getTime() + (5 * 60 * 1000);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('expiry', expiryTime.toString());
    this.commonService.showtoaster('Success', 'Login successful');
  }

  checkSession() {
    this.intervalId = setInterval(() => {
      const expiry = localStorage.getItem('expiry');
      if (expiry && new Date().getTime() > Number(expiry)) {
        localStorage.clear();
        this.commonService.showtoaster('Error', 'Session Expired');
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
}