// navigation-bar.component.ts
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login/login.service';
import { AvatarUploadService } from '../../services/avatar-upload.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user.models'; // Import the User model

@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.component.html',
  styleUrl: 'navigation-bar.component.css',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, RouterLink, CommonModule],
})
export class NavigationBarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  balance: number | null = null;
  userId: number | null = null; // Initialize as null

  constructor(
    public loginService: LoginService,
    public avatarUploadService: AvatarUploadService // Injection du service
  ) {}
  constructor(
    public loginService: LoginService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Vérifier si nous sommes dans un navigateur avant d'accéder à localStorage
    if (isPlatformBrowser(this.platformId)) {
      if (
        localStorage.getItem('token') &&
        this.loginService.user() === undefined
      ) {
        this.loginService.getUser().subscribe({
          next: (user: User | null | undefined) => {
            this.userId = user?.userId || null; // Use userId instead of id
            if (this.userId) {
              this.fetchBalance(); // Fetch balance only if userId is available
            }
          },
          error: (err) => {
            console.error(
              "Erreur lors de la récupération de l'utilisateur:",
              err
            );
          },
        });
      } else {
        const user = this.loginService.user();
        this.userId = user?.userId || null; // Use userId instead of id
        if (this.userId) {
          this.fetchBalance();
        }
      }
    }

    // Subscribe to login events to update the balance dynamically
    this.loginService.loginEvent.subscribe({
      next: (user: User | null | undefined) => {
        this.userId = user?.userId || null; // Use userId instead of id
        if (this.userId) {
          this.fetchBalance(); // Fetch balance immediately after login
        }
      },
      error: (err: any) => {
        console.error(
          "Erreur lors de la gestion de l'événement de connexion:",
          err
        );
      },
    });

    // Subscribe to balance changes
    this.userService.balanceChanged.subscribe({
      next: (newBalance: number) => {
        this.balance = newBalance;
      },
    });
  }

  fetchBalance(): void {
    if (this.userId) {
      this.userService.getUserBalance(this.userId).subscribe({
        next: (data) => {
          this.balance = data.balance;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du solde:', err);
        },
      });
    }
  }

  // Dans navigation-bar.component.ts
  logout() {
    this.loginService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
        // Rediriger vers la page d'accueil ou de connexion
        window.location.href = '/login';
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion', err);
      },
    });
  }

  getAvatarUrl(): string {
    const user = this.loginService.user();
    return this.avatarUploadService.getAvatarUrl(user?.userId);
  }
}
