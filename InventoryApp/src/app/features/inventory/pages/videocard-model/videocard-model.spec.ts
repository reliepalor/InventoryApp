// src/app/features/inventory/pages/videocard-model/videocard-model.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { VideocardModelPageComponent } from './videocard-model';
import { SidebarService } from '../../../services/sidebar.service';
import { VideocardModelService, VideoCardItem } from '../../../services/videocard-model.service';

class MockSidebarService {
  // emits true by default so layout class bindings work
  sidebarOpen$ = of(true);
}

class MockVideocardModelService {
  getAllVideocards() {
    const items: VideoCardItem[] = [];
    return of(items);
  }
  createVideocard(payload: Partial<VideoCardItem>) {
    const created: VideoCardItem = {
      id: 'mock-id',
      referenceId: payload.referenceId ?? 'VID-mock',
      videoCardName: payload.videoCardName ?? 'Mock Card',
      videoCardChipset: payload.videoCardChipset ?? 'MockChip'
    };
    return of(created);
  }
  updateVideocard(id: any, payload: Partial<VideoCardItem>) {
    const updated = { id, ...payload } as any;
    return of(updated);
  }
  deleteVideocard(id: any) {
    return of(null);
  }
}

describe('VideocardModelPageComponent', () => {
  let component: VideocardModelPageComponent;
  let fixture: ComponentFixture<VideocardModelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideocardModelPageComponent],
      providers: [
        { provide: SidebarService, useClass: MockSidebarService },
        { provide: VideocardModelService, useClass: MockVideocardModelService }
      ],
      // ignore unknown elements/attributes from nested components/templates
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideocardModelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
