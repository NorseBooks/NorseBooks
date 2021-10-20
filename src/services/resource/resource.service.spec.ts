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

  it('should get, set, and reset a resource', async () => {
    // get resource
    const resource1 = await resourceService.getResource<boolean>(
      'ADMIN_EMAILS',
    );
    expect(resource1).toBeDefined();
    expect(resource1).toBe(true);
    const resource2 = await resourceService.getResource<number>('SALT_ROUNDS');
    expect(resource2).toBeDefined();
    expect(resource2).toBe(12);
    const resource3 = await resourceService.getResource<string>('VERSION');
    expect(resource3).toBeDefined();
    expect(resource3).toBe('2.0.0');
    await expect(resourceService.getResource('FAKE_RESOURCE')).rejects.toThrow(
      ServiceException,
    );

    // set resource
    const resource4 = await resourceService.setResource('ADMIN_EMAILS', false);
    expect(resource4).toBeDefined();
    expect(resource4).toHaveProperty('name', 'ADMIN_EMAILS');
    expect(resource4).toHaveProperty('value', false);
    expect(resource4).toHaveProperty('type', 'BOOLEAN');
    const resource5 = await resourceService.setResource('SALT_ROUNDS', 13);
    expect(resource5).toBeDefined();
    expect(resource5).toHaveProperty('name', 'SALT_ROUNDS');
    expect(resource5).toHaveProperty('value', 13);
    expect(resource5).toHaveProperty('type', 'NUMBER');
    const resource6 = await resourceService.getResource<number>('SALT_ROUNDS');
    expect(resource6).toBeDefined();
    expect(resource6).toBe(13);
    const resource7 = await resourceService.setResource('VERSION', '2.0.1');
    expect(resource7).toBeDefined();
    expect(resource7).toHaveProperty('name', 'VERSION');
    expect(resource7).toHaveProperty('value', '2.0.1');
    expect(resource7).toHaveProperty('type', 'STRING');
    const resource8 = await resourceService.getResource<string>('VERSION');
    expect(resource8).toBeDefined();
    expect(resource8).toBe('2.0.1');
    await resourceService.setResource('ADMIN_EMAILS', true);
    await resourceService.setResource('SALT_ROUNDS', 12);
    await expect(
      resourceService.setResource('FAKE_RESOURCE', 1),
    ).rejects.toThrow(ServiceException);
    await expect(
      resourceService.setResource('SALT_ROUNDS', true),
    ).rejects.toThrow(ServiceException);
    await expect(
      resourceService.setResource('SALT_ROUNDS', 'test'),
    ).rejects.toThrow(ServiceException);

    // reset resource
    const resource9 = await resourceService.resetResource('VERSION');
    expect(resource9).toBeDefined();
    expect(resource9).not.toEqual(resource8);
    expect(resource9).toHaveProperty('name', 'VERSION');
    expect(resource9).toHaveProperty('value', '2.0.0');
    expect(resource9).toHaveProperty('type', 'STRING');
  });

  it('should get all resources', async () => {
    // get all resources
    const resources1 = await resourceService.getResources();
    expect(resources1).toBeDefined();
    expect(Object.keys(resources1).length).toBeGreaterThan(0);
    expect(resources1).toHaveProperty('SALT_ROUNDS', 12);
    expect(resources1).toHaveProperty('ADMIN_EMAILS', true);
    await resourceService.setResource('ADMIN_EMAILS', false);
    const resources2 = await resourceService.getResources();
    expect(resources2).toBeDefined();
    expect(Object.keys(resources2).length).toBeGreaterThan(0);
    expect(resources2).not.toEqual(resources1);
    expect(resources2).toHaveProperty('ADMIN_EMAILS', false);
    await resourceService.resetResource('ADMIN_EMAILS');
    const resources3 = await resourceService.getResources();
    expect(resources3).toBeDefined();
    expect(Object.keys(resources3).length).toBeGreaterThan(0);
    expect(resources3).not.toEqual(resources2);
    expect(resources3).toHaveProperty('ADMIN_EMAILS', true);
  });
});
