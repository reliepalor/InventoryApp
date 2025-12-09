import { Dashboard } from './features/inventory/pages/dashboard/dashboard';
import { Routes } from '@angular/router';
import { authGuard } from './features/services/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    { path: 'login', loadComponent: () => import('./features/inventory/auth/login/login.component').then(m => m.LoginPageComponent) },
    { path: 'register', loadComponent: () => import('./features/inventory/auth/register/register.component').then(m => m.RegisterPageComponent) },
    { 
        path: 'dashboard', 
        loadComponent: () => import('./features/inventory/pages/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [authGuard]
    },
    { 
        path: 'model', 
        loadComponent: () => import('./features/inventory/pages/model/model').then(m => m.ModelPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'motherboard',
        loadComponent: () => import('./features/inventory/pages/motherboard/motherboard').then(m => m.MotherboardPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'office-installed',
        loadComponent: () => import('./features/inventory/pages/office-installed/office-installed').then(m => m.OfficeInstalled),
        canActivate: [authGuard]
    },
    {
        path: 'os-installed',
        loadComponent: () => import('./features/inventory/pages/os-installed/os-installed').then(m => m.OsInstalled),
        canActivate: [authGuard]
    }
];
