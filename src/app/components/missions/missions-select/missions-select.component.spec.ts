import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsSelectComponent } from './missions-select.component';

describe('MissionsSelectComponent', () => {
  let component: MissionsSelectComponent;
  let fixture: ComponentFixture<MissionsSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionsSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissionsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
