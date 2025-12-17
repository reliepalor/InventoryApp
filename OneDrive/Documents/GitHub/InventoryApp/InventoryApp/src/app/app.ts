import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
// import { Navbar } from './features/inventory/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, /*Navbar*/],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('InventoryFrontend');
  readonly showNavbar = signal(false);

  constructor(private router: Router) {
    // Update navbar visibility on navigation end
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        const isAuth = url.startsWith('/login') || url.startsWith('/register');
        this.showNavbar.set(!isAuth);
      });
    
    // Set initial state
    const url = this.router.url;
    const isAuth = url.startsWith('/login') || url.startsWith('/register');
    this.showNavbar.set(!isAuth);
  }
}
