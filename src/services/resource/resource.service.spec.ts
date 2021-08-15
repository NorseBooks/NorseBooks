import { ResourceService } from '../resource/resource.service';
import { getService, afterTestsWait } from '../test-util';

describe('ResourceService', () => {
  let resourceService: ResourceService;

  beforeEach(async () => {
    resourceService = await getService(ResourceService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(resourceService).toBeDefined();
  });
});
