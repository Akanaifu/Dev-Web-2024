import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-compte',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-compte.component.html',
  styleUrl: './edit-compte.component.css',
})
export class EditCompteComponent {
  editForm: FormGroup;

  constructor(private fb: FormBuilder, http: HttpClient) {
    this.http = http;
    this.editForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Nom d'utilisateur
      email: ['', [Validators.required, Validators.email]], // Email
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]], // Ajout de confirmPassword
    });
  }
  private http: HttpClient;

  getCurrentUserId(): any {
    const token = localStorage.getItem('token'); // Récupérer le token
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` }; // Ajouter l'en-tête Authorization

    this.http
      .get<{ user_id: string }>('http://localhost:3000/get_id', { headers })
      .subscribe({
        next: (data) => {
          console.log('User ID fetched successfully:', data.user_id);
          // Vous pouvez stocker l'ID utilisateur dans une propriété ou l'utiliser directement
        },
        error: (err) => {
          console.error('Error fetching user ID:', err);
        },
      });
  }

  onSubmit() {
    const password = this.editForm.value.password;
    const confirmPassword = this.editForm.value.confirmPassword;

    if (password && password !== confirmPassword) {
      console.error('Passwords do not match!');
      return;
    }

    console.log(this.editForm.value);
    // clean form
    this.updateUserData();
    this.editForm.reset();
  }

  updateUserData() {
    const token = localStorage.getItem('token'); // Récupérer le token
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` }; // Ajouter l'en-tête Authorization
    const userData = this.editForm.value; // Récupérer les données du formulaire

    this.http
      .put('http://localhost:3000/edit-compte', userData, { headers })
      .subscribe({
        next: (response) => {
          console.log('User data updated successfully:', response);
          // Vous pouvez afficher un message de succès ou rediriger l'utilisateur
        },
        error: (err) => {
          console.error('Error updating user data:', err);
        },
      });
  }
}
