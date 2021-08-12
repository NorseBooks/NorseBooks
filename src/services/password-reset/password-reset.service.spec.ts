import { PasswordResetService } from '../password-reset/password-reset.service';
import { getService, afterTestsWait } from '../test-util';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  beforeEach(async () => {
    service = await getService(PasswordResetService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
