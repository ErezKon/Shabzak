import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoAssignCandidatesComponent } from './auto-assign-candidates.component';

describe('AutoAssignCandidatesComponent', () => {
  let component: AutoAssignCandidatesComponent;
  let fixture: ComponentFixture<AutoAssignCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoAssignCandidatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutoAssignCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
