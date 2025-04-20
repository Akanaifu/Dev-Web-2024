import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any = null;
  private readonly socketUrl = 'http://localhost:3000';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  connect(): void {
    if (this.isBrowser) {
      if (!this.socket) {
        // Import socket.io-client dynamiquement seulement côté navigateur
        import('socket.io-client').then(io => {
          this.socket = io.io(this.socketUrl);
        });
      } else if (this.socket.disconnected) {
        this.socket.connect();
      }
    }
  }

  disconnect(): void {
    if (this.isBrowser && this.socket) {
      this.socket.disconnect();
    }
  }

  emit(eventName: string, data: any): void {
    if (this.isBrowser && this.socket) {
      this.socket.emit(eventName, data);
    } else {
      console.error('Socket not connected or not in browser environment');
    }
  }

  on<T>(eventName: string): Observable<T> {
    if (!this.isBrowser) {
      return of() as Observable<T>; // Retourne un Observable vide si on n'est pas dans un navigateur
    }

    return new Observable<T>(observer => {
      if (!this.socket) {
        this.connect();
        // Attendre que le socket soit initialisé
        setTimeout(() => {
          if (this.socket) {
            this.socket.on(eventName, (data: T) => {
              observer.next(data);
            });
          }
        }, 100);
      } else {
        this.socket.on(eventName, (data: T) => {
          observer.next(data);
        });
      }

      return () => {
        if (this.socket) {
          this.socket.off(eventName);
        }
      };
    });
  }

  isConnected(): boolean {
    return this.isBrowser && this.socket !== null && this.socket.connected;
  }
}