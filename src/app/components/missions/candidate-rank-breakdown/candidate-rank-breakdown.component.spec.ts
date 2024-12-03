import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateRankBreakdownComponent } from './candidate-rank-breakdown.component';

describe('CandidateRankBreakdownComponent', () => {
  let component: CandidateRankBreakdownComponent;
  let fixture: ComponentFixture<CandidateRankBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateRankBreakdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CandidateRankBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
