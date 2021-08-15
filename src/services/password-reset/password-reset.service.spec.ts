import { PasswordResetService } from '../password-reset/password-reset.service';
import { getService, afterTestsWait } from '../test-util';

describe('PasswordResetService', () => {
  let passwordResetService: PasswordResetService;

  beforeEach(async () => {
    passwordResetService = await getService(PasswordResetService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(passwordResetService).toBeDefined();
  });
});
