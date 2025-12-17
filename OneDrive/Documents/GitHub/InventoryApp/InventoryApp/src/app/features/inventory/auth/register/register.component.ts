import { AuthService } from './../../../services/AuthService';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  // private router = inject(Router);
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showSuccessModal: boolean = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      // Password must be at least 6 chars and contain a digit (matches backend Identity policy)
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/(?=.*\d)/)]],
      confirmPassword: ['', Validators.required],
      role: ['User']
    }, { validators: this.passwordsMatch });
  }
  // This will handle the registration form submission
  onSubmit(): void {
    
    // Validate matching passwords
    if (this.registerForm.invalid) {
      if (this.registerForm.errors?.['mismatch']) {
        this.errorMessage = 'Passwords do not match.';
      } else {
        this.errorMessage = 'Please fill in all required fields correctly.';
      }
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    const { username, email, password, confirmPassword, role } = this.registerForm.value;

    // include role explicitly and forward any confirmPassword for backend diagnostics
    this.authService.register({ username, email, password, confirmPassword, role }).subscribe({
      next: (response: any) => {
        console.log('Registration successful', response);
        // show success message at top of form
        this.successMessage = 'Account created successfully! You may now log in.';
        this.errorMessage = '';
        this.isLoading = false;
        // optionally reset the form
        this.registerForm.reset({ role: 'User' });
      },
      error: (error: any) => {
        console.error('Registration failed', error);
        // If backend returns an array of identity errors, flatten them
        if (Array.isArray(error?.error)) {
          this.errorMessage = error.error.map((e: any) => e.description || e).join(' ');
        } else if (typeof error?.error === 'string') {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = error?.message || 'Registration failed. Please try again.';
        }
        this.successMessage = '';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  passwordsMatch(form: FormGroup) {
    const pw = form.get('password')?.value;
    const cp = form.get('confirmPassword')?.value;
    return pw && cp && pw === cp ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
