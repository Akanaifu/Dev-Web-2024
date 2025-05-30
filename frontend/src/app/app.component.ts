import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from './component/navigation-bar/navigation-bar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from './component/chat-multy/chat-multy.component';
import { LoginService } from './services/login/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavigationBarComponent,
    MatButtonModule,
    MatTooltipModule,
    ChatComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  @ViewChild('chatComponent') chatComponent!: ChatComponent;

  constructor(public loginService: LoginService) {}
  public title = 'frontend';
  toggleChat(): void {
    this.chatComponent.toggle();
  }
}
