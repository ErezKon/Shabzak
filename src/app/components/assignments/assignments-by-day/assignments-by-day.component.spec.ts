import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsByDayComponent } from './assignments-by-day.component';

describe('AssignmentsByDayComponent', () => {
  let component: AssignmentsByDayComponent;
  let fixture: ComponentFixture<AssignmentsByDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentsByDayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentsByDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
