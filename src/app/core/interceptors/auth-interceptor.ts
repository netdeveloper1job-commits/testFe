import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private commonService: CommonService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authToken = this.auth.getToken();

    this.commonService.show();

    let modifiedRequest = request;

    if (authToken) {
      modifiedRequest = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + authToken,
        },
      });
    }

    return next.handle(modifiedRequest).pipe(
      finalize(() => this.commonService.hide()),
      catchError((error) => {
        console.error('HTTP Error:', error);
        return throwError(() => error);
      })

    );
  }
}