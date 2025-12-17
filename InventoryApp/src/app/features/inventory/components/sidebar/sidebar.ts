import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';
import { AddTableService, TableDefinition } from '../../../services/add-table.service';

@Component({
  selector: 'app-sidebar',
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
    { label: 'Model', route: '/model' },
    { label: 'Motherboard', route: '/motherboard' },
    { label: 'Office Installed', route: '/office-installed' },
    { label: 'OS Installed', route: '/os-installed' },
    { label: 'Processor', route: '/processor' },
    { label: 'RAM Model', route: '/ram-model' },
    { label: 'RAM Size', route: '/ram-size' },
    { label: 'Storage Model', route: '/storage-model' },
    { label: 'Storage Size', route: '/storage-size' },
    { label: 'Video Card Memory', route: '/videocard-memory' },
    { label: 'Video Card Model', route: '/videocard-model' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  private tableService = inject(AddTableService);

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
    this.loadCustomTables();
  }

  loadCustomTables() {
    this.tableService.getAllTables().subscribe(tables => {
      const customItems = tables.map(table => ({
        label: table.name,
        route: '/table/' + table.id
      }));
      this.maintenanceItems = [...this.maintenanceItems, ...customItems];
    });
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
    this.authService.Logout();
    this.router.navigate(['/login']);
  }

  // trackBy to optimize ngFor
  trackByRoute(index: number, item: { label: string; route: string }) {
    return item.route;
  }
}