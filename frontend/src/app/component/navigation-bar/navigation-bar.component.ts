// navigation-bar.component.ts
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.component.html',
  styleUrl: 'navigation-bar.component.css',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, RouterLink, CommonModule],
})
export class NavigationBarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor(public loginService: LoginService) {}

  ngOnInit() {
    // Vérifier si nous sommes dans un navigateur avant d'accéder à localStorage
    if (isPlatformBrowser(this.platformId)) {
      // Maintenant nous sommes sûrs d'être dans un navigateur
      if (localStorage.getItem('token') && this.loginService.user() === undefined) {
        this.loginService.getUser().subscribe();
      }
    }
  }

  logout() {
    this.loginService.logout().subscribe();
  }
}