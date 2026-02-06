import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (token && !auth.isLoggedIn()) {
    auth.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired'));
  }

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      const status = error?.status;
      const isAuthEndpoint = req.url.includes('/users/login') || req.url.includes('/users/register');
      if (!isAuthEndpoint && (status === 401 || status === 403)) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
