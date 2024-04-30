import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldiersFilterComponent } from './soldiers-filter.component';

describe('SoldiersFilterComponent', () => {
  let component: SoldiersFilterComponent;
  let fixture: ComponentFixture<SoldiersFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldiersFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoldiersFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
