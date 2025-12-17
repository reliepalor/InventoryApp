import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { SidebarService } from '../../../services/sidebar-service';

@Component({
  selector: 'app-sidebar',
  // If you don't use Angular standalone components, remove 'standalone: true' and add this component to a module.
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  // breakpoint in px; change to 768 for tablet breakpoint if you prefer
  private readonly BREAKPOINT = 1024;

  isMaintenanceOpen = false;
  isSidebarOpen = true;

  maintenanceItems = [
    { label: 'Brand', route: '/brand' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);

  constructor() {
    // subscribe to service so multiple components share state
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
      // if sidebar becomes collapsed, hide maintenance
      if (!this.isSidebarOpen) {
        this.isMaintenanceOpen = false;
      }
    });

    // Listen to route changes and keep maintenance open if route matches
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        this.isMaintenanceOpen = this.maintenanceItems.some(item =>
          currentUrl.startsWith(item.route)
        );
      }
    });
  }

  ngOnInit(): void {
    // initial responsive check (guard window for SSR)
    if (typeof window !== 'undefined') {
      this.applyResponsiveSidebar(window.innerWidth);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const width = (event.target as Window).innerWidth;
    this.applyResponsiveSidebar(width);
  }

  private applyResponsiveSidebar(width: number) {
    const shouldBeOpen = width > this.BREAKPOINT;

    if (shouldBeOpen !== this.isSidebarOpen) {
      // update via service so entire app sees the change
      this.sidebarService.setSidebar(shouldBeOpen);
      if (!shouldBeOpen) {
        this.isMaintenanceOpen = false;
      }
    }
  }

  toggleMaintenance(): void {
    this.isMaintenanceOpen = !this.isMaintenanceOpen;
  }

  expandAndOpenMaintenance(): void {
    if (!this.isSidebarOpen) {
      this.sidebarService.setSidebar(true);
    }
    this.isMaintenanceOpen = true;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // trackBy to optimize ngFor
  trackByRoute(index: number, item: { label: string; route: string }) {
    return item.route;
  }
}
