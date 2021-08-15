import { VerifyService } from '../verify/verify.service';
import { getService, afterTestsWait } from '../test-util';

describe('VerifyService', () => {
  let verifyService: VerifyService;

  beforeEach(async () => {
    verifyService = await getService(VerifyService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(verifyService).toBeDefined();
  });
});
