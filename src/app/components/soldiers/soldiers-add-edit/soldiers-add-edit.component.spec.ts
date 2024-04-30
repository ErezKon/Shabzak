import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldiersAddEditComponent } from './soldiers-add-edit.component';

describe('SoldiersAddEditComponent', () => {
  let component: SoldiersAddEditComponent;
  let fixture: ComponentFixture<SoldiersAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldiersAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoldiersAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
