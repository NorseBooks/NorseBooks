import { ResourceService } from './resource.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('ResourceService', () => {
  let resourceService: ResourceService;

  beforeAll(async () => {
    resourceService = await getService(ResourceService);
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
    const resource1 = await resourceService.getResource<number>('SALT_ROUNDS');
    expect(resource1).toBeDefined();
    expect(resource1).toBe(12);
    await expect(
      resourceService.getResource<string>('FAKE_RESOURCE'),
    ).rejects.toThrow(ServiceException);
  });

  it('should get all resources', async () => {
    // get all resources
    const resources = await resourceService.getResources();
    expect(resources).toBeDefined();
    expect(Object.keys(resources).length).toBeGreaterThan(0);
    expect(resources).toHaveProperty('SALT_ROUNDS', 12);
  });
});
