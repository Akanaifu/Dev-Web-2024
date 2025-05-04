import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const headers = req.headers.set('Authorization', 'Token ' + token);
    const requestToSend = req.clone({
      headers: headers
    });
    return next(requestToSend);
  }
  
  return next(req);
};

