import { TestBed } from '@angular/core/testing';

import { RouletteNetService } from './roulette-net.service';

describe('RouletteNetService', () => {
  let service: RouletteNetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouletteNetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
