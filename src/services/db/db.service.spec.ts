import { DBService } from '../db/db.service';
import { getService, afterTestsWait } from '../test-util';

describe('DBService', () => {
  let service: DBService;

  beforeEach(async () => {
    service = await getService(DBService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
