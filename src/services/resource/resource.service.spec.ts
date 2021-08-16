import { ResourceService } from '../resource/resource.service';
import { getService } from '../test-util';

describe('ResourceService', () => {
  let resourceService: ResourceService;

  beforeAll(async () => {
    resourceService = await getService(ResourceService);
  });

  it('should be defined', () => {
    expect(resourceService).toBeDefined();
  });
});
