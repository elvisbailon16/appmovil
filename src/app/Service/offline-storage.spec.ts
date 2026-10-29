import { TestBed } from '@angular/core/testing';

import { OfflineStorage } from './offline-storage';

describe('OfflineStorage', () => {
  let service: OfflineStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
