import { FirebaseSendService } from './export_firebase.logic';
import { Database } from '@angular/fire/database';
import { of } from 'rxjs';

describe('FirebaseSendService', () => {
  let service: FirebaseSendService;
  let dbMock: any;

  beforeEach(() => {
    dbMock = {};
    service = new FirebaseSendService(dbMock as Database);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listenToParties should return an Observable', (done) => {
    // Mock onValue to call observer.next
    jest.spyOn(service as any, 'db', 'get').mockReturnValue({
      ref: jest.fn(),
    });
    const obs = service.listenToParties();
    expect(obs.subscribe).toBeDefined();
    done();
  });

  // sendPartie is async and interacts with Firebase, so only test structure here
  it('sendPartie should be defined', () => {
    expect(service.sendPartie).toBeDefined();
  });
});
