// navigation-bar.component.ts
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login/login.service';
import { UserService } from '../../services/user/user.service';

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

  constructor(public loginService: LoginService, private userService: UserService) {}

  ngOnInit() {
    // Vérifier si nous sommes dans un navigateur avant d'accéder à localStorage
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('token') && this.loginService.user() === undefined) {
        this.loginService.getUser().subscribe({
          next: (user) => {
            this.userId = (user as any)?.id || null; // Dynamically set userId
            if (this.userId) {
              this.fetchBalance(); // Fetch balance only if userId is available
            }
          },
          error: (err) => {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err);
          },
        });
      } else {
        const user = this.loginService.user();
        this.userId = (user as any)?.id || null; // Set userId if already available
        if (this.userId) {
          this.fetchBalance();
        }
      }
    }
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
      }
    });
  }
}