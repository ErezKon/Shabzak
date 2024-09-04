import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsBySoldierComponent } from './assignments-by-soldier.component';

describe('AssignmentsBySoldierComponent', () => {
  let component: AssignmentsBySoldierComponent;
  let fixture: ComponentFixture<AssignmentsBySoldierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentsBySoldierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentsBySoldierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
