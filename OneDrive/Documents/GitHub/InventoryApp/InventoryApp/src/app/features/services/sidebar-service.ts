import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  public sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.getValue());
  }

  setSidebar(isOpen: boolean): void {
    this.sidebarOpenSubject.next(isOpen);
  }
}
