import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableSoldiersComponent } from './available-soldiers.component';

describe('AvailableSoldiersComponent', () => {
  let component: AvailableSoldiersComponent;
  let fixture: ComponentFixture<AvailableSoldiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableSoldiersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AvailableSoldiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
