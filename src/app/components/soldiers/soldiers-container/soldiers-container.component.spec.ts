import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldiersContainerComponent } from './soldiers-container.component';

describe('SoldiersContainerComponent', () => {
  let component: SoldiersContainerComponent;
  let fixture: ComponentFixture<SoldiersContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldiersContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoldiersContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
