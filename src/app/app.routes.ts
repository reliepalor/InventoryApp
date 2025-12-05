import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile.component';
import { Dashboard } from './pages/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';
import { LaptopInventoryPageComponent } from './core/inventory/pages/laptop-inventory-page/laptop-inventory-page.component';
import { LaptopNewPageComponent } from './features/inventory/pages/laptop-new-page/laptop-new-page.component';
import { LaptopReportsPageComponent } from './features/inventory/pages/laptop-reports-page/laptop-reports-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  { path: 'dashboard', component: Dashboard},

  {
    path: 'inventory/laptops',
    component: LaptopInventoryPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'inventory/laptops/new',
    component: LaptopNewPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'inventory/laptops/reports',
    component: LaptopReportsPageComponent,
    canActivate: [AuthGuard]
  },
  

  // You can add these later when pages exist:
  // {
  //   path: 'inventory/laptops/new',
  //   component: LaptopInventoryNewPageComponent,
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'inventory/laptops/reports',
  //   component: LaptopInventoryReportsPageComponent,
  //   canActivate: [AuthGuard]
  // },

  { path: '**', redirectTo: 'login' }
];
