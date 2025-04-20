import { Component, OnInit, OnDestroy, Input, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-multy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-multy.component.html',
  styleUrl: './chat-multy.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  
  username = 'anonymous';
  messageText = '';
  messages: any[] = [];
  clientsTotal = 0;
  feedback = '';
  private subscriptions: Subscription[] = [];
  private audioElement: any = null;
  private isBrowser: boolean;

  constructor(
    private socketService: SocketService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Créer l'objet Audio uniquement dans un environnement navigateur
    if (this.isBrowser) {
      this.audioElement = new Audio('/audio/message-tone.mp3');

      this.audioElement.addEventListener('error', (e: Event) => {
        const error = e.target as HTMLMediaElement;
        console.error('Audio error code:', error.error);
        console.error('Audio network state:', error.networkState);
        console.error('Audio ready state:', error.readyState);
      });
    }
  }

  ngOnInit(): void {
    // Connect to socket server only in browser environment
    if (this.isBrowser) {
      this.socketService.connect();
      
      // Listen for total clients
      this.subscriptions.push(
        this.socketService.on<number>('clients-total').subscribe((total: number) => {
          this.clientsTotal = total;
        })
      );
      
      // Listen for incoming messages
      this.subscriptions.push(
        this.socketService.on<any>('chat-message').subscribe((data: any) => {
          this.feedback = '';
          this.playNotificationSound();
          this.addMessageToUI(false, data);
        })
      );
      
      // Listen for typing feedback
      this.subscriptions.push(
        this.socketService.on<any>('feedback').subscribe((data: any) => {
          this.feedback = data.feedback;
        })
      );
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
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

  // Autres méthodes...
  
  sendMessage(event: Event): void {
    event.preventDefault();
    if (this.messageText === '' || !this.isBrowser) return;

    const data = {
      name: this.username,
      message: this.messageText,
      dateTime: new Date()
    };

    this.socketService.emit('message', data);
    this.addMessageToUI(true, data);
    this.messageText = '';
  }

  addMessageToUI(isOwnMessage: boolean, data: any): void {
    this.messages.push({
      ...data,
      isMine: isOwnMessage
    });
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
      this.socketService.emit('feedback', {
        feedback: `✍️${this.username} is typing a message`
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
  }
}