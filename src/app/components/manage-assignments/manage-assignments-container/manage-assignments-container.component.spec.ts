import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAssignmentsContainerComponent } from './manage-assignments-container.component';

describe('ManageAssignmentsContainerComponent', () => {
  let component: ManageAssignmentsContainerComponent;
  let fixture: ComponentFixture<ManageAssignmentsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAssignmentsContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageAssignmentsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
