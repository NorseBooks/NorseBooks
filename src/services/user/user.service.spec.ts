import { UserService } from '../user/user.service';
import { getService, afterTestsWait } from '../test-util';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    service = await getService(UserService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
