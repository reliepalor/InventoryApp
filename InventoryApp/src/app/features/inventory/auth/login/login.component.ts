import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginPageComponent {
  // use typed form group for stronger type checking
  loginForm = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    remember: new FormControl<boolean>(false, { nonNullable: true })
  });

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  returnUrl = '/dashboard';

  // prefer consistent injection style
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  constructor() {
    // read returnUrl from query params (if present)
    const qsReturn = this.route.snapshot.queryParams['returnUrl'];
    if (typeof qsReturn === 'string' && qsReturn.length) {
      this.returnUrl = qsReturn;
    }

    // redirect if already logged in
    try {
      if (this.authService?.isLoggedIn && this.authService.isLoggedIn()) {
        this.router.navigateByUrl(this.returnUrl);
      }
    } catch (e) {
      // if authService.isLoggedIn isn't present or throws, silently ignore
      console.warn('AuthService isLoggedIn check failed', e);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // mark controls as touched so validation messages appear
    Object.values(this.loginForm.controls).forEach(control => control.markAsTouched());

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const username = this.loginForm.controls.username.value;
    const password = this.loginForm.controls.password.value;
    const payload = { username, password };

    // assume AuthService.login returns Observable<any>
    let obs: Observable<any>;
    try {
      obs = this.authService.login(payload);
    } catch (err) {
      // synchronous error from calling login()
      this.isLoading = false;
      this.errorMessage = 'Login failed to start: ' + (err as Error).message;
      return;
    }

    obs.subscribe({
      next: (response: any) => {
        console.log('Login successful', response);
        // if your login returns a JWT, you might want to store it here (AuthService may already do it)
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error: any) => {
        console.error('Login failed', error);
        if (error && typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error && typeof error.message === 'string') {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Invalid username or password';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // helper method to check if field has a specific error or any error
  hasError(fieldName: 'username' | 'password' | 'remember', errorType?: string): boolean {
    const field = this.loginForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  // Dev helper: fill demo credentials (only visible if env.authStatic.enabled === true)
  fillDemoCredentials(which: 'admin' | 'user' = 'admin'): void {
    if (!this.loginForm) return;
    if (which === 'admin') {
      this.loginForm.patchValue({ username: 'admin', password: 'admin123' });
    } else {
      this.loginForm.patchValue({ username: 'user', password: 'user1234' });
    }
  }
}
