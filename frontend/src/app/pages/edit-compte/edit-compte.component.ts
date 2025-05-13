import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-compte',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-compte.component.html',
  styleUrl: './edit-compte.component.css',
})
export class EditCompteComponent {
  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
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
    this.editForm.reset();
  }
}
