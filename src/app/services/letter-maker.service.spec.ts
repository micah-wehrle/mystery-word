import { TestBed } from '@angular/core/testing';

import { LetterMakerService } from './letter-maker.service';

describe('LetterMakerService', () => {
  let service: LetterMakerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LetterMakerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
