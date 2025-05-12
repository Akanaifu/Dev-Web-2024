import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { default as io } from 'socket.io-client';

export interface RoomStats {
  [key: string]: number; // Permet d'utiliser n'importe quelle chaîne comme clé
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any = null;
  private readonly socketUrl = 'http://localhost:3000';
  private isBrowser: boolean;
  
  // Nouveaux sujets pour suivre les statistiques des salons
  private currentRoomSubject = new BehaviorSubject<string>('general');
  public currentRoom$ = this.currentRoomSubject.asObservable();
  
  private roomStatsSubject = new BehaviorSubject<RoomStats>({
    'general': 0,
    'machine-a-sous': 0,
    'roulette': 0,
    'poker': 0
  });
  public roomStats$ = this.roomStatsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('SocketService initialized, isBrowser:', this.isBrowser);
  }

  connect(): void {
    if (this.isBrowser) {
      if (!this.socket) {
        console.log('Connexion au serveur socket à:', this.socketUrl);
        this.socket = io(this.socketUrl, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket'],
        });

        this.socket.on('connect', () => {
          console.log('Socket connecté avec ID:', this.socket.id);
          
          // Rejoindre le salon par défaut
          this.joinRoom('general');
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('Erreur de connexion socket:', error);
        });
        
        // Écouter les mises à jour des statistiques
        this.socket.on('room-stats', (stats: RoomStats) => {
          console.log('Statistiques des salons reçues:', stats);
          this.roomStatsSubject.next(stats);
        });
        
        // Écouter les confirmations de changement de salon
        this.socket.on('room-changed', (data: {room: string, usersInRoom: number}) => {
          console.log('Salon changé pour:', data.room, 'avec', data.usersInRoom, 'utilisateurs');
          this.currentRoomSubject.next(data.room);

          const updatedStats = {...this.roomStatsSubject.value};
          updatedStats[data.room] = data.usersInRoom;
          this.roomStatsSubject.next(updatedStats);
        });
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
      // Ajouter le salon actuel aux données si nécessaire
      const enhancedData = {
        ...data,
        room: this.currentRoomSubject.value
      };
      
      console.log('Emitting event:', eventName, enhancedData);
      this.socket.emit(eventName, enhancedData);
    } else {
      console.error('Socket not connected or not in browser environment');
    }
  }
  
  // Nouvelle méthode pour rejoindre un salon
  joinRoom(roomName: string): void {
    if (this.isBrowser && this.socket) {
      console.log('Joining room:', roomName);
      this.socket.emit('join-room', roomName);
    }
  }

  on<T>(eventName: string): Observable<T> {
    if (!this.isBrowser) {
      console.log(
        'Not in browser, returning empty observable for event:',
        eventName
      );
      return of() as Observable<T>;
    }

    return new Observable<T>((observer) => {
      if (!this.socket) {
        console.log('Socket not initialized, connecting now');
        this.connect();
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
        }, 300);
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
  
  // Getter pour le salon actuel
  getCurrentRoom(): string {
    return this.currentRoomSubject.value;
  }
}