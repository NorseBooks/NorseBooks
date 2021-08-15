import { UserService } from '../user/user.service';
import { getService, afterTestsWait } from '../test-util';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    userService = await getService(UserService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
