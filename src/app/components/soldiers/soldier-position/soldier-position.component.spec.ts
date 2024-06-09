import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldierPositionComponent } from './soldier-position.component';

describe('SoldierPositionComponent', () => {
  let component: SoldierPositionComponent;
  let fixture: ComponentFixture<SoldierPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldierPositionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoldierPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
