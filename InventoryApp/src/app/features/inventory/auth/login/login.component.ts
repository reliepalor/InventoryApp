import { Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
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
export class LoginPageComponent implements OnInit, OnDestroy{

  verses = [
    {
      reference: 'Proverbs 16:3',
      text: 'Commit to the Lord whatever you do, and he will establish your plans.'
    },
    {
      reference: 'Psalm 37:5',
      text: 'Commit your way to the Lord; trust in him and he will do this.'
    },
    {
      reference: 'Jeremiah 29:11',
      text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.'
    },
    {
      reference: 'Philippians 4:13',
      text: 'I can do all things through Christ who strengthens me.'
    },
    {
      reference: 'Psalm 127:1',
      text: 'Unless the Lord builds the house, the builders labor in vain.'
    }
  ];

  currentVerseIndex = 0;
  isFading= false;
  private verseIntervalId?: number;

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

  ngOnInit(): void {
    this.startVerseLoop();
  }

  ngOnDestroy(): void {
    if (this.verseIntervalId){
      clearInterval(this.verseIntervalId);
    }
  }

  startVerseLoop(): void {
    this.verseIntervalId = window.setInterval(() => {
      this.isFading = true;

      setTimeout(() => {
        this.currentVerseIndex =
        (this.currentVerseIndex + 1) % this.verses.length;

        this.isFading = false;
      }, 500);
    }, 5000);
  }

  get currentVerse(){
    return this.verses[this.currentVerseIndex];
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
