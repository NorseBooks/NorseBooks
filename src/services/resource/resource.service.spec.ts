import { ResourceService } from '../resource/resource.service';
import { getService, afterTestsWait } from '../test-util';

describe('ResourceService', () => {
  let service: ResourceService;

  beforeEach(async () => {
    service = await getService(ResourceService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
