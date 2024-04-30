import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsFilterComponent } from './missions-filter.component';

describe('MissionsFilterComponent', () => {
  let component: MissionsFilterComponent;
  let fixture: ComponentFixture<MissionsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionsFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissionsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
