import { NavigationEnd } from '@angular/router';
import { AuthService } from './../../../services/AuthService';
import { Component, inject, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginPageComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  loginForm: FormGroup;
  private formSub?: Subscription;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.formSub = this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
      this.successMessage = '';
    });
  }

  // Handle Login Form submission
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    const payload = {
      username: username?.trim(),
      password
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.successMessage = 'Signed in successfully.';
        // show a brief success message then navigate
        setTimeout(() => this.router.navigateByUrl('/dashboard'), 300);
      },
      error: (error: any) => {
        if (error?.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
