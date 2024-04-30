import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsAddEditComponent } from './missions-add-edit.component';

describe('MissionsAddEditComponent', () => {
  let component: MissionsAddEditComponent;
  let fixture: ComponentFixture<MissionsAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionsAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissionsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
