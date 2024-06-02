import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionInstanceAddEditComponent } from './mission-instance-add-edit.component';

describe('MissionInstanceAddEditComponent', () => {
  let component: MissionInstanceAddEditComponent;
  let fixture: ComponentFixture<MissionInstanceAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionInstanceAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissionInstanceAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
