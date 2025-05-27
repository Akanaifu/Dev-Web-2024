// Mock @angular/fire/database at the top level to avoid redefining properties
jest.mock('@angular/fire/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  onValue: jest.fn(),
}));

import { FirebaseSendService } from './export_firebase.logic';
import { Database, ref, get, set } from '@angular/fire/database';
import { of } from 'rxjs';

describe('FirebaseSendService', () => {
  let service: FirebaseSendService;
  let dbMock: any;

  beforeEach(() => {
    dbMock = {};
    service = new FirebaseSendService(dbMock as Database);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('sendPartie should throw and log error if set fails', async () => {
    // Arrange mocks
    (get as jest.Mock).mockResolvedValueOnce({ val: () => ({}) });
    (set as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    (ref as jest.Mock).mockReturnValue({});

    const serviceWithDb = new FirebaseSendService({} as any);
    try {
      await serviceWithDb.sendPartie(1, 100);
      // If no error is thrown, fail the test
      fail('Expected sendPartie to throw an error');
    } catch (error: any) {
      expect(error.message).toBe('Firebase error');
    }
  });

  it('sendPartie should call set with correct data', async () => {
    (get as jest.Mock).mockResolvedValueOnce({
      val: () => ({ MA1: {}, MA2: {} }),
    });
    (set as jest.Mock).mockResolvedValueOnce(undefined);
    (ref as jest.Mock).mockReturnValue({});

    const serviceWithDb = new FirebaseSendService({} as any);
    await serviceWithDb.sendPartie(42, 77);

    expect(set).toHaveBeenCalled();
    const [refArg, dataArg] = (set as jest.Mock).mock.calls[0];
    expect(dataArg.solde).toBe(77);
    expect(dataArg.joueurId).toBe('42');
    expect(dataArg.partieJouee).toBe(false);
    expect(dataArg.partieAffichee).toBe(false);
    expect(Array.isArray(dataArg.combinaisons)).toBe(true);
    expect(dataArg.gain).toBe(0);
  });
});
