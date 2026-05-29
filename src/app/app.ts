import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { IdleService } from './core/services/idle';
import { AuditService } from './core/services/audit.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    private idleService: IdleService,
    private router: Router,
    private auditService: AuditService
  ) {}
  protected readonly title = signal('complainceHub-fe');

ngOnInit() {

  this.idleService.startWatching();

  this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe((event: any) => {

      const user = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      // USER NAHI HAI TO RETURN
      if (!user?.id) {
        return;
      }

      const currentRoute = event.urlAfterRedirects;

      this.auditService
        .updateAction(currentRoute)
        .subscribe();

    });
}
}

