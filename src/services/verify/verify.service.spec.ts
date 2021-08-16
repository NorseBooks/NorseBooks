import { VerifyService } from '../verify/verify.service';
import { getService } from '../test-util';

describe('VerifyService', () => {
  let verifyService: VerifyService;

  beforeAll(async () => {
    verifyService = await getService(VerifyService);
  });

  it('should be defined', () => {
    expect(verifyService).toBeDefined();
  });
});
