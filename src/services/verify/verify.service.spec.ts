import { VerifyService } from '../verify/verify.service';
import { getService, afterTestsWait } from '../test-util';

describe('VerifyService', () => {
  let service: VerifyService;

  beforeEach(async () => {
    service = await getService(VerifyService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
