import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-compte',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-compte.component.html',
  styleUrl: './edit-compte.component.css',
})
export class EditCompteComponent implements OnInit {
  editForm: FormGroup;
  playerInfo: {
    user_id: number;
    username?: string;
    email?: string;
  } = {
    user_id: 0,
  };
  constructor(
    private fb: FormBuilder,
    http: HttpClient,
    private router: Router
  ) {
    this.http = http;
    this.editForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Nom d'utilisateur
      email: ['', [Validators.required, Validators.email]], // Email
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]], // Ajout de confirmPassword
    });
  }
  private http: HttpClient;

  ngOnInit(): void {
    console.log('Initialisation du composant EditCompte');
    this.getPlayerInfo(); // Fetch user ID on component initialization
  }

  onSubmit() {
    const password = this.editForm.value.password;
    const confirmPassword = this.editForm.value.confirmPassword;

    if (password && password !== confirmPassword) {
      console.error('Passwords do not match!');
      return;
    }

    if (!this.playerInfo.user_id) {
      console.error('User ID is not available. Cannot submit the form.');
      return;
    }

    const formData = {
      userId: this.playerInfo.user_id,
      username: this.editForm.value.username || this.playerInfo.username, // Retain previous username if empty
      email: this.editForm.value.email || this.playerInfo.email, // Retain previous email if empty
      password: password || null, // Include password only if provided
    };

    this.http
      .put('/api/edit-compte/edit-compte', formData)
      .subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.editForm.reset();
        },
        error: (err) => {
          console.error('Error updating user:', err);
        },
      });
  }

  getPlayerInfo(): void {
    this.http
      .get<{ user_id: number; username: string; email: string }>(
        '/api/get_id/info'
      )
      .subscribe({
        next: (data) => {
          this.playerInfo = data;
          console.log('Informations du joueur :', this.playerInfo);
        },
        error: (err) => {
          console.error(
            'Erreur lors de la récupération des informations :',
            err
          );
        },
      });
  }
}
