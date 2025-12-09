import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeInstalled } from './office-installed';

describe('OfficeInstalled', () => {
  let component: OfficeInstalled;
  let fixture: ComponentFixture<OfficeInstalled>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeInstalled]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeInstalled);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
