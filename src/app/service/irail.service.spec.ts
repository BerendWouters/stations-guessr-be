import { TestBed } from '@angular/core/testing';

import { IrailService } from './irail.service';

describe('IrailService', () => {
  let service: IrailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IrailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
