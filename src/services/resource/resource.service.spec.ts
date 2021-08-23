import { ResourceService } from './resource.service';
import { getService } from '../test-util';

describe('ResourceService', () => {
  let resourceService: ResourceService;

  beforeAll(async () => {
    resourceService = await getService(ResourceService);
  });

  it('should be defined', () => {
    expect(resourceService).toBeDefined();
  });

  it('should check if resources exist', async () => {
    // exists
    const exists1 = await resourceService.resourceExists('SALT_ROUNDS');
    expect(exists1).toBe(true);
    const exists2 = await resourceService.resourceExists('FAKE_RESOURCE');
    expect(exists2).toBe(false);
  });

  it('should get a resource', async () => {
    // get resource
    const resource1 = await resourceService.getResource('SALT_ROUNDS');
    expect(resource1).toBeDefined();
    expect(resource1).toBe('12');
    const resource2 = await resourceService.getResource('FAKE_RESOURCE');
    expect(resource2).toBeUndefined();
  });

  it('should get all resources', async () => {
    // get all resources
    const resources = await resourceService.getResources();
    expect(resources).toBeDefined();
    expect(Object.keys(resources).length).toBeGreaterThan(0);
    expect(resources).toHaveProperty('SALT_ROUNDS', '12');
  });
});
