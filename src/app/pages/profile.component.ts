import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-profile',
  template: `
   
    
  `
})
export class ProfileComponent implements OnInit {
  user: any;
  dataFromApi: string | null = null;

  constructor(private auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.user = this.auth.getUser();

    // example protected call (token attached by interceptor)
    this.http.get(`${environment.apiUrl}/protected/hello`, { responseType: 'text' }).subscribe({
      next: v => this.dataFromApi = v,
      error: () => this.dataFromApi = 'Could not fetch'
    });
  }

  logout() {
    this.auth.logout();
    // navigate to login or homepage
  }
}
