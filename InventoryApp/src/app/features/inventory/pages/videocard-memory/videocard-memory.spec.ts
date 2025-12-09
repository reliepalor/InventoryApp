// src/app/features/inventory/pages/videocard-memory/videocard-memory.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideocardMemoryPageComponent } from './videocard-memory';

describe('VideocardMemory', () => {
  let component: VideocardMemoryPageComponent;
  let fixture: ComponentFixture<VideocardMemoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideocardMemoryPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VideocardMemoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default initial state', () => {
    expect(component.isLoading).toBeFalse();
    expect(component.videoCardMemories).toBeDefined();
    expect(component.videoCardMemories.length).toBe(0);
    expect(component.filteredVideoCardMemories).toBeDefined();
    expect(component.filteredVideoCardMemories.length).toBe(0);
    expect(component.searchTerm).toBe('');
    expect(component.showForm).toBeFalse();
    expect(component.showDeleteModal).toBeFalse();
  });
});
