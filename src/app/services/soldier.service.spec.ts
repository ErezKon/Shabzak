import { TestBed } from '@angular/core/testing';

import { SoldierService } from './soldier.service';

describe('SoldierService', () => {
  let service: SoldierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoldierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
