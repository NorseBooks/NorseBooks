import { PasswordResetService } from '../password-reset/password-reset.service';
import { getService } from '../test-util';

describe('PasswordResetService', () => {
  let passwordResetService: PasswordResetService;

  beforeAll(async () => {
    passwordResetService = await getService(PasswordResetService);
  });

  it('should be defined', () => {
    expect(passwordResetService).toBeDefined();
  });
});
