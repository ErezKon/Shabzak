import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataContainerComponent } from './metadata-container.component';

describe('MetadataContainerComponent', () => {
  let component: MetadataContainerComponent;
  let fixture: ComponentFixture<MetadataContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetadataContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetadataContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
