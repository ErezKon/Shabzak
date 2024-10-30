import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsFilterComponent } from './assignments-filter.component';

describe('AssignmentsFilterComponent', () => {
  let component: AssignmentsFilterComponent;
  let fixture: ComponentFixture<AssignmentsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentsFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
