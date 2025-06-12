import { Component, OnInit, OnDestroy, Input, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService, RoomStats } from '../../services/socket/socket.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/login/login.service';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';

interface ChatMessage {
  name: string;
  message: string;
  dateTime: Date;
  room: string;
  isMine: boolean;
  isSystem?: boolean;
}

@Component({
  selector: 'app-chat-multy',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatBadgeModule],
  templateUrl: './chat-multy.component.html',
  styleUrl: './chat-multy.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  
  username = 'anonymous';
  messageText = '';
  messages: ChatMessage[] = [];
  
  // Liste des salons disponibles
  availableRooms: string[] = ['general', 'machine-a-sous', 'roulette', 'poker'];
  
  roomMessages: {[key: string]: ChatMessage[]} = {
    'general': [],
    'machine-a-sous': [],
    'roulette': [],
    'poker': []
  };
  
  clientsTotal = 0;
  roomStats: RoomStats = {
    'general': 0,
    'machine-a-sous': 0,
    'roulette': 0,
    'poker': 0
  };
  
  currentRoom = 'general';
  feedback = '';
  private subscriptions: Subscription[] = [];
  private audioElement: any = null;
  private isBrowser: boolean;

  constructor(
    private socketService: SocketService,
    public loginService: LoginService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      try {
        this.audioElement = new Audio('../../../public/audio/message-tone.mp3');
        this.audioElement.addEventListener('error', (e: any) => {
          console.error('Erreur audio:', e);
        });
      } catch (error) {
        console.error('Erreur lors de la création de l\'élément audio:', error);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const clickedElement = event.target as HTMLElement;
    const chatContainer = document.querySelector('.chat-container');
    const chatButton = document.querySelector('.chat-button');
    
    if (this.isVisible && 
        chatContainer && 
        chatButton && 
        !chatContainer.contains(clickedElement) && 
        !chatButton.contains(clickedElement)) {
      this.isVisible = false;
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.socketService.connect();
      
      if (this.loginService.user()) {
        this.username = this.loginService.user()?.username || 'anonymous';
      }
      
      // S'abonner au salon actuel
      this.subscriptions.push(
        this.socketService.currentRoom$.subscribe(room => {
          console.log('Salon actuel changé:', room);
          this.currentRoom = room;
          this.messages = this.roomMessages[room] || [];
        })
      );
      
      // S'abonner aux statistiques des salons
      this.subscriptions.push(
        this.socketService.roomStats$.subscribe(stats => {
          console.log('Statistiques des salons mises à jour:', stats);
          this.roomStats = stats;
        })
      );
      
      // S'abonner au nombre total de clients
      this.subscriptions.push(
        this.socketService.on<number>('clients-total').subscribe((total: number) => {
          this.clientsTotal = total;
        })
      );
      
      // S'abonner aux messages entrants
      this.subscriptions.push(
        this.socketService.on<any>('chat-message').subscribe((data: any) => {
          this.feedback = '';
          this.playNotificationSound();
          
          // Déterminer le salon du message
          const room = data.room || this.currentRoom;
          
          // Ajouter le message au bon salon
          this.addMessageToUI(false, {
            ...data,
            room: room
          });
        })
      );
      
      // S'abonner aux feedbacks de frappe
      this.subscriptions.push(
        this.socketService.on<any>('feedback').subscribe((data: any) => {
          this.feedback = data.feedback;
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.isBrowser) {
      this.socketService.disconnect();
    }
  }

  playNotificationSound(): void {
    if (this.isBrowser && this.audioElement) {
      this.audioElement.play().catch((err: Error) => console.error('Audio error:', err));
    }
  }
  
  sendMessage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.messageText === '' || !this.isBrowser) return;

    const data = {
      name: this.loginService.user()?.username || 'anonymous',
      message: this.messageText,
      dateTime: new Date(),
      room: this.currentRoom
    };

    this.socketService.emit('message', data);
    this.addMessageToUI(true, data);
    this.messageText = '';
  }

  addMessageToUI(isOwnMessage: boolean, data: any): void {
    const message: ChatMessage = {
      ...data,
      isMine: isOwnMessage
    };
    
    // Ajouter au salon approprié
    const room = data.room || this.currentRoom;
    if (!this.roomMessages[room]) {
      this.roomMessages[room] = [];
    }
    this.roomMessages[room].push(message);
    
    // Mettre à jour les messages affichés si on est dans ce salon
    if (room === this.currentRoom) {
      this.messages = this.roomMessages[room];
    }
    
    // Scroll to bottom
    if (this.isBrowser) {
      setTimeout(() => {
        const container = document.querySelector('.message-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 10);
    }
  }

  onTyping(): void {
    if (this.isBrowser) {
      const username = this.loginService.user()?.username || this.username;
      this.socketService.emit('feedback', {
        feedback: `✍️${username} is typing a message`
      });
    }
  }

  onBlur(): void {
    if (this.isBrowser) {
      this.socketService.emit('feedback', {
        feedback: ''
      });
    }
  }

  formatTime(dateTime: Date): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString();
  }

  toggle(): void {
    this.isVisible = !this.isVisible;
    
    if (this.isVisible && this.isBrowser) {
      setTimeout(() => {
        const container = document.querySelector('.message-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    }
  }
  
  // Nouvelle méthode pour changer de salon
  changeRoom(roomName: string): void {
    if (roomName !== this.currentRoom) {
      this.socketService.joinRoom(roomName);
    }
  }
  
  // Vérifier si un salon a des messages non lus
  hasUnreadMessages(room: string): boolean {
    // À implémenter si nécessaire
    return false;
  }
}