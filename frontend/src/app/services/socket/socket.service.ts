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
    console.log('SocketService initialized, isBrowser:', this.isBrowser);
  }

  connect(): void {
    if (this.isBrowser) {
      if (!this.socket) {
        // Import socket.io-client dynamiquement seulement côté navigateur
        import('socket.io-client').then(io => {
          console.log('Connecting to socket server at:', this.socketUrl);
          this.socket = io.io(this.socketUrl, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket']
          });
          
          // Logs de débogage pour connexion socket
          this.socket.on('connect', () => {
            console.log('Socket connected with ID:', this.socket.id);
          });
          
          this.socket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
          });
          
          this.socket.on('reconnect_attempt', (attempt: number) => {
            console.log('Socket reconnection attempt:', attempt);
          });
        });
      } else if (this.socket.disconnected) {
        console.log('Reconnecting existing socket');
        this.socket.connect();
      }
    }
  }

  disconnect(): void {
    if (this.isBrowser && this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
    }
  }

  emit(eventName: string, data: any): void {
    if (this.isBrowser && this.socket) {
      console.log('Emitting event:', eventName, data);
      this.socket.emit(eventName, data);
    } else {
      console.error('Socket not connected or not in browser environment');
    }
  }

  on<T>(eventName: string): Observable<T> {
    if (!this.isBrowser) {
      console.log('Not in browser, returning empty observable for event:', eventName);
      return of() as Observable<T>; // Retourne un Observable vide si on n'est pas dans un navigateur
    }

    return new Observable<T>(observer => {
      if (!this.socket) {
        console.log('Socket not initialized, connecting now');
        this.connect();
        // Attendre que le socket soit initialisé
        setTimeout(() => {
          if (this.socket) {
            console.log('Registering event listener for:', eventName);
            this.socket.on(eventName, (data: T) => {
              console.log('Received event:', eventName, data);
              observer.next(data);
            });
          } else {
            console.error('Socket still not initialized after timeout');
          }
        }, 300); // Délai plus long pour s'assurer que la connexion est établie
      } else {
        console.log('Registering event listener for:', eventName);
        this.socket.on(eventName, (data: T) => {
          console.log('Received event:', eventName, data);
          observer.next(data);
        });
      }

      return () => {
        if (this.socket) {
          console.log('Removing event listener for:', eventName);
          this.socket.off(eventName);
        }
      };
    });
  }

  isConnected(): boolean {
    return this.isBrowser && this.socket !== null && this.socket.connected;
  }
}