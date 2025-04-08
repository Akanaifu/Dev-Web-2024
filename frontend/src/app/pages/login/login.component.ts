 import { Component, inject, OnDestroy } from '@angular/core';
 import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
 import { MatButtonModule } from '@angular/material/button';
 import { MatInputModule } from '@angular/material/input';
 import { LoginCredentials, LoginService } from '../../services/login/login.service';
 import { Router } from '@angular/router';
 import { Subscription } from 'rxjs';

 @Component({
 	selector: 'app-login',
 	standalone: true,
 	imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
 	templateUrl: './login.component.html',
 	styleUrl: './login.component.css'
 })
 export class LoginComponent implements OnDestroy {

 	private formBuilder = inject(FormBuilder);
 	private loginService = inject(LoginService);
 	private router = inject(Router);

 	private loginSubscripton: Subscription | null = null;

 	loginFormGroup = this.formBuilder.group({
 		'username': ['', [Validators.required]],
 		'password': ['', [Validators.required]]
 	});

 	invalidCredentials = false;

 	login() {
 		this.loginSubscripton = this.loginService.login( this.loginFormGroup.value as LoginCredentials ).subscribe({
 			next: result => { this.navigateJeux(); },
 			error: error => { 
				console.log(error);
				this.invalidCredentials = true; 
			}
 		});
 	}

 	navigateJeux() {
 		this.router.navigate(['jeux']);
 	}

 	ngOnDestroy(): void {
 		this.loginSubscripton?.unsubscribe();
 	}
 }