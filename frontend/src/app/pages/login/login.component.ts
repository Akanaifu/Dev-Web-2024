import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NavigationBarComponent } from '../../component/navigation-bar/navigation-bar.component';


@Component({
 	selector: 'app-login',
 	standalone: true,
 	imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, NavigationBarComponent],
 	templateUrl: './login.component.html',
 	styleUrl: './login.component.css'
})
export class LoginComponent {
 	private formBuilder = inject(FormBuilder);
	loginFormGroup = this.formBuilder.group({
 		'username': ['', [Validators.required]],
 		'password': ['', [Validators.required]]
});

invalidCredentials = false;

login() {
	}

}