import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (req.url.startsWith('/api')) {
    const requestToSend = req.clone({
      withCredentials: true
    });
    return next(requestToSend);
  }
  
  return next(req);
};