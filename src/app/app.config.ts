import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { LucideAngularModule, House, Laptop, BarChart, User, Menu, ChevronLeft, ChevronRight } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(),
    importProvidersFrom(LucideAngularModule.pick({
      House,
      Laptop,
      BarChart,
      User,
      Menu,
      ChevronLeft,
      ChevronRight
    }))
  ]
};
