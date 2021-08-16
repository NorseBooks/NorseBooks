import { UserService } from '../user/user.service';
import { getService } from '../test-util';

describe('UserService', () => {
  let userService: UserService;

  beforeAll(async () => {
    userService = await getService(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
