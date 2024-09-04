import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsByMissionComponent } from './assignments-by-mission.component';

describe('AssignmentsByMissionComponent', () => {
  let component: AssignmentsByMissionComponent;
  let fixture: ComponentFixture<AssignmentsByMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentsByMissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentsByMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
