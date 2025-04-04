import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuallyAssignContainerComponent } from './manually-assign-container.component';

describe('ManuallyAssignContainerComponent', () => {
  let component: ManuallyAssignContainerComponent;
  let fixture: ComponentFixture<ManuallyAssignContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManuallyAssignContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManuallyAssignContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
