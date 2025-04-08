import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { catchError, map, of } from 'rxjs';

export const isLoggedInGuard: CanActivateFn = (route, state) => {
  
  const loginService = inject(LoginService);
  const router = inject(Router);
  
  if (loginService.user() == undefined) {
    return loginService.getUser().pipe(
      map(_ => true),
      catchError(_ => router.navigate(['login']))
    )
  }
  
  if (!loginService.user()) {
    router.navigate(['login']);
  }
  
  return true;
  
 };