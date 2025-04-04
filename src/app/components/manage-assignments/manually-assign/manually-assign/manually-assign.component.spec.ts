import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuallyAssignComponent } from './manually-assign.component';

describe('ManuallyAssignComponent', () => {
  let component: ManuallyAssignComponent;
  let fixture: ComponentFixture<ManuallyAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManuallyAssignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManuallyAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
