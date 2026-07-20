import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

/**
 * SECURITY: HTTP interceptor that attaches the JWT Bearer token to all
 * outgoing API requests. The backend validates this token on every
 * protected endpoint (all except /Login).
 *
 * If no token is stored (user not logged in), the request is sent without
 * the Authorization header — the backend will return 401 Unauthorized.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const token = userService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
