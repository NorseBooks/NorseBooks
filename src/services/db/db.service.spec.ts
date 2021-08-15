import { DBService } from '../db/db.service';
import { getService, afterTestsWait } from '../test-util';
import { NBResource } from '../resource/resource.interface';

describe('DBService', () => {
  let dbService: DBService;

  beforeEach(async () => {
    dbService = await getService(DBService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(dbService).toBeDefined();
  });

  it('should create, get by fields, and delete by fields', async () => {
    // create
    const resourceName = 'message';
    const resourceValue = 'Hello, world!';
    const resource1 = await dbService.create<NBResource>('NB_RESOURCE', {
      name: resourceName,
      value: resourceValue,
    });
    expect(resource1).toBeDefined();
    expect(resource1).toHaveProperty('name', resourceName);
    expect(resource1).toHaveProperty('value', resourceValue);

    // get by fields
    const resource2 = await dbService.getByFields<NBResource>('NB_RESOURCE', {
      name: resourceName,
      value: resourceValue,
    });
    expect(resource2).toBeDefined();
    expect(resource2).toHaveProperty('name', resourceName);
    expect(resource2).toHaveProperty('value', resourceValue);

    // delete by fields
    await dbService.deleteByFields('NB_RESOURCE', {
      name: resourceName,
      value: resourceValue,
    });

    // get by fields
    const resource3 = await dbService.getByFields<NBResource>('NB_RESOURCE', {
      name: resourceName,
      value: resourceValue,
    });
    expect(resource3).not.toBeDefined();
  });
});
