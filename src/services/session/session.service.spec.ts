import { SessionService } from '../session/session.service';
import { getService, afterTestsWait } from '../test-util';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    service = await getService(SessionService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
