import { SessionService } from '../session/session.service';
import { getService, afterTestsWait } from '../test-util';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(async () => {
    sessionService = await getService(SessionService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });
});
