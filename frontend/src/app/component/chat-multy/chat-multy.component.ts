import { Component, OnInit, OnDestroy, Input, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket/socket.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-chat-multy',
  standalone: true,
  imports: [CommonModule, FormsModule], // LoginService ne doit pas être ici
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
    public loginService: LoginService, // Ajouté correctement ici
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Créer l'objet Audio uniquement dans un environnement navigateur
    if (this.isBrowser) {
      try {
        this.audioElement = new Audio('./assets/audio/message-tone.mp3');
        
        // Ajouter un gestionnaire pour les erreurs
        this.audioElement.addEventListener('error', (e: any) => {
          console.error('Erreur audio:', e);
        });
      } catch (error) {
        console.error('Erreur lors de la création de l\'élément audio:', error);
      }
    }
  }

  // Fermer le chat en cliquant ailleurs sur la page
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const clickedElement = event.target as HTMLElement;
    const chatContainer = document.querySelector('.chat-container');
    const chatButton = document.querySelector('.chat-button');
    
    // Si on clique en dehors du chat et du bouton chat et que le chat est visible
    if (this.isVisible && 
        chatContainer && 
        chatButton && 
        !chatContainer.contains(clickedElement) && 
        !chatButton.contains(clickedElement)) {
      this.isVisible = false;
    }
  }

  ngOnInit(): void {
    // Connect to socket server only in browser environment
    if (this.isBrowser) {
      this.socketService.connect();
      
      // Définir le nom d'utilisateur depuis le service de login s'il est connecté
      if (this.loginService.user()) {
        this.username = this.loginService.user()?.username || 'anonymous';
      }
      
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
  
  sendMessage(event: Event): void {
    event.preventDefault();
    event.stopPropagation(); // Empêcher la propagation pour éviter la fermeture du chat
    if (this.messageText === '' || !this.isBrowser) return;

    const data = {
      name: this.loginService.user()?.username || 'anonymous', // Utiliser le nom d'utilisateur du service de login
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
    
    // Scroll vers le bas des messages quand on ouvre le chat
    if (this.isVisible && this.isBrowser) {
      setTimeout(() => {
        const container = document.querySelector('.message-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    }
  }
}