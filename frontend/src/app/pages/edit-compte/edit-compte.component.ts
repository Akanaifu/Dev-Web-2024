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
import { AvatarUploadService } from '../../services/avatar-upload.service';

@Component({
  selector: 'app-edit-compte',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
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
  selectedFile: File | null = null;
  avatarPreviewUrl: string = 'assets/default.png';

  // Ajoute une propriété pour l'URL de l'avatar utilisateur
  avatarUrl: string = 'assets/default.png';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private avatarUploadService: AvatarUploadService // Ajoute ceci
  ) {
    this.editForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Nom d'utilisateur
      email: ['', [Validators.required, Validators.email]], // Email
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]], // Ajout de confirmPassword
    });
  }

  ngOnInit(): void {
    console.log('Initialisation du composant EditCompte');
    this.getPlayerInfo();
    this.loadAvatar(); // Charge l'avatar au démarrage
  }

  // Nouvelle méthode pour charger l'avatar depuis le backend
  loadAvatar(): void {
    if (!this.playerInfo.user_id) {
      this.avatarUrl = 'assets/default.png';
      return;
    }
    // Ajoute un timestamp pour forcer le rafraîchissement du cache navigateur
    this.avatarUrl = `http://localhost:3000/avatar/${this.playerInfo.user_id}?t=${Date.now()}`;
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
      .put('http://localhost:3000/edit-compte/edit-compte', formData)
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
        'http://localhost:3000/get_id/info'
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.avatarPreviewUrl = 'assets/default.png';
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile || !this.playerInfo.user_id) {
      console.error('Aucun fichier sélectionné ou user_id manquant');
      return;
    }
    this.avatarUploadService
      .uploadAvatar(this.selectedFile, this.playerInfo.user_id)
      .subscribe({
        next: (res) => {
          console.log('Avatar uploadé avec succès', res);
          this.selectedFile = null;
          this.loadAvatar(); // Recharge l'avatar après upload
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload de l\'avatar', err);
        },
      });
  }
}
