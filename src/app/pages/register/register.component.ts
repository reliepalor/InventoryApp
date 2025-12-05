import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginPlaceholderComponent } from 'app/components/login-placeholder/login-placeholder.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, LoginPlaceholderComponent]
})
export class RegisterComponent {
  form: FormGroup;

  error: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: (group) => this.passwordsMatch(group) });
  }

  passwordsMatch(group: any) {
    return group.get('password').value === group.get('confirmPassword').value
      ? null : { notMatching: true };
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;
    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.loading = false;
        // optionally auto-login — call login() or redirect to login page
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed';
      }
    });
  }
}
