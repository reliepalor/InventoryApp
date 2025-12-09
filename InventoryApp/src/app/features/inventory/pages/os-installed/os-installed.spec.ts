import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsInstalled } from './os-installed';

describe('OsInstalled', () => {
  let component: OsInstalled;
  let fixture: ComponentFixture<OsInstalled>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsInstalled]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsInstalled);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
