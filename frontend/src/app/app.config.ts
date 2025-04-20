import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authTokenInterceptor } from './interceptor/auth-token.interceptor';
import { provideClientHydration } from '@angular/platform-browser';
import { SocketService } from './services/socket/socket.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideClientHydration(),
    SocketService,
    provideHttpClient(
      withFetch(), 
      withInterceptors([authTokenInterceptor])
    )
  ]
};
