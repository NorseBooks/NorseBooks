/**
 * Resource service tests.
 * @packageDocumentation
 */

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

  it('should get and set a resource', async () => {
    // get resource
    const resource1 = await resourceService.getResource<number>('SALT_ROUNDS');
    expect(resource1).toBeDefined();
    expect(resource1).toBe(12);
    const resource2 = await resourceService.getResource<string>('VERSION');
    expect(resource2).toBeDefined();
    expect(resource2).toBe('2.0.0');
    await expect(
      resourceService.getResource<string>('FAKE_RESOURCE'),
    ).rejects.toThrow(ServiceException);

    // set resource
    const resource3 = await resourceService.setResource('SALT_ROUNDS', 13);
    expect(resource3).toBeDefined();
    expect(resource3).toHaveProperty('name', 'SALT_ROUNDS');
    expect(resource3).toHaveProperty('value', 13);
    expect(resource3).toHaveProperty('type', 'NUMBER');
    const resource4 = await resourceService.getResource<number>('SALT_ROUNDS');
    expect(resource4).toBeDefined();
    expect(resource4).toBe(13);
    const resource5 = await resourceService.setResource('VERSION', '2.0.1');
    expect(resource5).toBeDefined();
    expect(resource5).toHaveProperty('name', 'VERSION');
    expect(resource5).toHaveProperty('value', '2.0.1');
    expect(resource5).toHaveProperty('type', 'STRING');
    const resource6 = await resourceService.getResource<string>('VERSION');
    expect(resource6).toBeDefined();
    expect(resource6).toBe('2.0.1');
    await resourceService.setResource('SALT_ROUNDS', 12);
    await resourceService.setResource('VERSION', '2.0.0');
    await expect(
      resourceService.setResource('FAKE_RESOURCE', 1),
    ).rejects.toThrow(ServiceException);

    // set invalid resource
    await expect(
      resourceService.setResource('SALT_ROUNDS', true),
    ).rejects.toThrow(ServiceException);
    await expect(
      resourceService.setResource('SALT_ROUNDS', 'test'),
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
