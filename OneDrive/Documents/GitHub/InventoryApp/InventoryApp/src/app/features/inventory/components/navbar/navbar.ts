import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../../services/sidebar-service';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  // styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isSidebarOpen = true;
  username: string | null = null;
  showUserMenu = false;

  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
      this.cdr.detectChanges();
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
