import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPlaceholderComponent } from '../../components/login-placeholder/login-placeholder.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoginPlaceholderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {

  form: FormGroup;
  error: string | null = null;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // ⬅ prefill
      password: ['', [Validators.required, Validators.minLength(6)]], // ⬅ prefill
    });
  }

  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    // 🔥 STATIC TEST LOGIN
    if (email === 'admin@gmail.com' && password === 'admin123') {
      localStorage.setItem('auth_token', 'static-test-token');
      this.router.navigate(['/dashboard']);
      return;
    }

    // 🌐 REAL API LOGIN
    this.loading = true;
    this.error = null;

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Login Failed';
      }
    });
  }
}
