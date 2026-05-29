import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class IdleService {

  private timeout: any;
  private timeLimit = 5 * 60 * 1000; // 5 min

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private auth: AuthService,
    private commonService:CommonService
  ) {}

  startWatching() {

    this.ngZone.runOutsideAngular(() => {

      this.resetTimer();

      ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
        .forEach(evt =>
          window.addEventListener(evt, () => this.resetTimer())
        );
    });
  }

  private resetTimer() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {

      // ⚡ move back into Angular zone
      this.ngZone.run(() => {
        this.logout();
      });

    }, this.timeLimit);
  }

  private logout() {
      this.commonService.showtoaster(
      'Error',
      'Session Expired'
    );

    this.auth.logout();
  }
}