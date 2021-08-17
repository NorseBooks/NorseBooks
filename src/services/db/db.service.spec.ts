import { DBService } from '../db/db.service';
import { getService } from '../test-util';
import { NBResource } from '../resource/resource.interface';
import { NBImage } from '../image/image.interface';

describe('DBService', () => {
  let dbService: DBService;

  beforeAll(async () => {
    dbService = await getService(DBService);
  });

  it('should be defined', () => {
    expect(dbService).toBeDefined();
  });

  it('should create and get/update/delete by ID', async () => {
    // create
    const imageData = 'abcde';
    const image1 = await dbService.create<NBImage>('NB_IMAGE', {
      data: imageData,
    });
    expect(image1).toBeDefined();
    expect(image1).toHaveProperty('id');
    expect(image1).toHaveProperty('data', imageData);
    expect(image1).toHaveProperty('createTime');

    // get by ID
    const image2 = await dbService.getByID<NBImage>('NB_IMAGE', image1.id);
    expect(image2).toBeDefined();
    expect(image2).toEqual(image1);

    // update by ID
    const newImageData = 'vwxyz';
    const image3 = await dbService.updateByID<NBImage>('NB_IMAGE', image1.id, {
      data: newImageData,
    });
    expect(image3).toBeDefined();
    expect(image3).not.toEqual(image1);
    expect(image3).toHaveProperty('id');
    expect(image3).toHaveProperty('data', newImageData);
    expect(image3).toHaveProperty('createTime');
    const image4 = await dbService.getByID<NBImage>('NB_IMAGE', image1.id);
    expect(image4).toBeDefined();
    expect(image4).toEqual(image3);

    // delete by ID
    await dbService.deleteByID('NB_IMAGE', image1.id);
    const image5 = await dbService.getByID<NBImage>('NB_IMAGE', image1.id);
    expect(image5).toBeUndefined();
  });

  it('should create and get/update/delete by fields', async () => {
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

    // update by fields
    const newResourceValue = 'Hello, resource!';
    const resources = await dbService.updateByFields<NBResource>(
      'NB_RESOURCE',
      { name: resourceName },
      { value: newResourceValue },
    );
    expect(resources).toBeDefined();
    expect(resources.length).toBe(1);
    const resource3 = resources[0];
    expect(resource3).toBeDefined();
    expect(resource3).toHaveProperty('name', resourceName);
    expect(resource3).toHaveProperty('value', newResourceValue);
    const resource4 = await dbService.getByFields<NBResource>('NB_RESOURCE', {
      name: resourceName,
      value: resourceValue,
    });
    expect(resource4).toBeUndefined();
    const resource5 = await dbService.getByFields<NBResource>('NB_RESOURCE', {
      name: resourceName,
      value: newResourceValue,
    });
    expect(resource5).toBeDefined();
    expect(resource5).toHaveProperty('name', resourceName);
    expect(resource5).toHaveProperty('value', newResourceValue);

    // delete by fields
    await dbService.deleteByFields('NB_RESOURCE', {
      name: resourceName,
      value: newResourceValue,
    });

    // get by fields
    const resource6 = await dbService.getByFields<NBResource>('NB_RESOURCE', {
      name: resourceName,
      value: newResourceValue,
    });
    expect(resource6).toBeUndefined();
  });

  it('should create and get/update/delete custom', async () => {
    // create
    const imageData = 'abcde';
    const image1 = await dbService.create<NBImage>('NB_IMAGE', {
      data: imageData,
    });
    expect(image1).toBeDefined();
    expect(image1).toHaveProperty('id');
    expect(image1).toHaveProperty('data', imageData);
    expect(image1).toHaveProperty('createTime');

    // get custom
    const image2 = await dbService.getCustom<NBImage>('NB_IMAGE', '"id" = ?', [
      image1.id,
    ]);
    expect(image2).toBeDefined();
    expect(image2).toEqual(image1);

    // update custom
    const newImageData = 'vwxyz';
    const images = await dbService.updateCustom<NBImage>(
      'NB_IMAGE',
      `"id" = ?`,
      { data: newImageData },
      [image1.id],
    );
    expect(images).toBeDefined();
    expect(images.length).toBe(1);
    const image3 = images[0];
    expect(image3).toBeDefined();
    expect(image3).not.toEqual(image1);
    expect(image3).toHaveProperty('id');
    expect(image3).toHaveProperty('data', newImageData);
    expect(image3).toHaveProperty('createTime');
    const image4 = await dbService.getCustom<NBImage>('NB_IMAGE', '"id" = ?', [
      image1.id,
    ]);
    expect(image4).toBeDefined();
    expect(image4).toEqual(image3);

    // delete custom
    await dbService.deleteCustom('NB_IMAGE', '"id" = ?', [image1.id]);
    const image5 = await dbService.getCustom<NBImage>('NB_IMAGE', '"id" = ?', [
      image1.id,
    ]);
    expect(image5).toBeUndefined();
  });

  it('should create, list, and delete', async () => {
    // create
    const imageData = ['123', '456', '789'];
    const images: NBImage[] = [];
    for (const data of imageData) {
      const image = await dbService.create<NBImage>('NB_IMAGE', { data });
      images.push(image);
    }

    // list
    const listedImages1 = await dbService.list<NBImage>('NB_IMAGE', {
      fieldName: 'createTime',
      sortOrder: 'ASC',
    });
    expect(listedImages1).toBeDefined();
    expect(listedImages1.length).toBe(imageData.length);
    expect(listedImages1).toEqual(images);

    // list by fields
    const listedImages2 = await dbService.listByFields<NBImage>(
      'NB_IMAGE',
      { id: images[0].id },
      { fieldName: 'createTime', sortOrder: 'ASC' },
    );
    expect(listedImages2).toBeDefined();
    expect(listedImages2.length).toBe(1);
    expect(listedImages2).toEqual([images[0]]);

    // list custom
    const listedImages3 = await dbService.listCustom<NBImage>(
      'NB_IMAGE',
      '"id" = ? OR "id" = ?',
      { fieldName: 'createTime', sortOrder: 'ASC' },
      [images[0].id, images[1].id],
    );
    expect(listedImages3).toBeDefined();
    expect(listedImages3.length).toBe(2);
    expect(listedImages3).toEqual([images[0], images[1]]);

    // delete
    await dbService.deleteCustom('NB_IMAGE', '1=1');
    const listedImages4 = await dbService.list<NBImage>('NB_IMAGE');
    expect(listedImages4).toBeDefined();
    expect(listedImages4.length).toBe(0);
  });
});
