import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoAssignComponent } from './auto-assign.component';

describe('AutoAssignComponent', () => {
  let component: AutoAssignComponent;
  let fixture: ComponentFixture<AutoAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoAssignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutoAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
