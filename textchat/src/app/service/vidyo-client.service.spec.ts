import { TestBed } from '@angular/core/testing';

import { VidyoClientService } from './vidyo-client.service';

describe('VidyoClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VidyoClientService = TestBed.get(VidyoClientService);
    expect(service).toBeTruthy();
  });
});
