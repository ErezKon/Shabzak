import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsContainerComponent } from './missions-container.component';

describe('MissionsContainerComponent', () => {
  let component: MissionsContainerComponent;
  let fixture: ComponentFixture<MissionsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionsContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissionsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
