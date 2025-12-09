import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, Navbar],
  templateUrl: './dashboard.html',
  // styleUrl: './dashboard.css',
})
export class Dashboard {
  isSidebarOpen = true;

  private authService = inject(AuthService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}
