import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginPageComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  returnUrl: string = '/dashboard';

  // expose environment to template to conditionally show demo buttons
  env: any = environment;

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private zone = inject(NgZone);

  constructor(
    private fb: FormBuilder,
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });

    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn()) {
      // wrap in zone to be safe
      this.zone.run(() => this.router.navigate([this.returnUrl]));
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (response: any) => {
        console.log('Login successful', response);

        // Defensive: ensure token is saved (AuthService may already set it)
        if (response?.token) {
          try {
            this.authService.setToken(response.token);
            // also store user minimally if present
            if (response?.username || response?.user) {
              localStorage.setItem('auth_user', JSON.stringify({ username: response.username || response.user }));
            }
            console.log('Token stored to localStorage:', localStorage.getItem('auth_token'));
          } catch (err) {
            console.warn('Error storing token:', err);
          }
        } else {
          console.warn('Response contained no token:', response);
        }

        // Navigate inside Angular zone and log result
        this.zone.run(() => {
          this.router.navigate([this.returnUrl], { replaceUrl: true }).then((navOk) => {
            console.log('Router.navigate resolved:', navOk, '-> current url:', window.location.href);
            if (!navOk) {
              console.warn('Navigation returned false — likely blocked by a guard or incorrect route.');
            }
          }).catch(navErr => {
            console.error('Router.navigate error:', navErr);
          });
        });
      },
      error: (error: any) => {
        console.error('Login failed', error);
        if (typeof error?.error === 'string') {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = error?.message || 'Invalid username or password';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Helper method to check if field has error
  hasError(fieldName: string, errorType?: string): boolean {
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
