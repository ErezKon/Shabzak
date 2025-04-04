import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldiersSelectComponent } from './soldiers-select.component';

describe('SoldiersSelectComponent', () => {
  let component: SoldiersSelectComponent;
  let fixture: ComponentFixture<SoldiersSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldiersSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoldiersSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
