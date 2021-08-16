import { SessionService } from '../session/session.service';
import { getService } from '../test-util';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeAll(async () => {
    sessionService = await getService(SessionService);
  });

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });
});
