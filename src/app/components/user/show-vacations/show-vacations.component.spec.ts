import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowVacationsComponent } from './show-vacations.component';

describe('ShowVacationsComponent', () => {
  let component: ShowVacationsComponent;
  let fixture: ComponentFixture<ShowVacationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowVacationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowVacationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
