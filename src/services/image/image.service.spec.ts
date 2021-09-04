/**
 * Image service tests.
 * @packageDocumentation
 */

import { ImageService } from './image.service';
import { ResourceService } from '../resource/resource.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('ImageService', () => {
  let imageService: ImageService;
  let resourceService: ResourceService;

  let largeImage: string;

  beforeAll(async () => {
    imageService = await getService(ImageService);
    resourceService = await getService(ResourceService);

    const maxImageSize = await resourceService.getResource<number>(
      'MAX_IMAGE_SIZE',
    );
    largeImage = '0'.repeat(maxImageSize * 1.1);
  });

  it('should create, check existence, and delete an image', async () => {
    // create
    const imageData = 'abc';
    const image = await imageService.createImage(imageData);
    expect(image).toBeDefined();
    expect(image).toHaveProperty('id');
    expect(image).toHaveProperty('data');
    expect(image).toHaveProperty('createTime');

    // create too large
    await expect(imageService.createImage(largeImage)).rejects.toThrow(
      ServiceException,
    );

    // check existence
    const imageExists1 = await imageService.imageExists(image.id);
    expect(imageExists1).toBe(true);

    // delete
    await imageService.deleteImage(image.id);
    const imageExists2 = await imageService.imageExists(image.id);
    expect(imageExists2).toBe(false);
  });

  it('should create, get, set, and delete an image', async () => {
    // create
    const imageData = 'abc';
    const image1 = await imageService.createImage(imageData);
    expect(image1).toBeDefined();
    expect(image1).toHaveProperty('id');
    expect(image1).toHaveProperty('data');
    expect(image1).toHaveProperty('createTime');

    // get
    const image2 = await imageService.getImage(image1.id);
    expect(image2).toBeDefined();
    expect(image2).toEqual(image1);

    // set
    const newImageData = 'def';
    const image3 = await imageService.setImageData(image1.id, newImageData);
    expect(image3).toBeDefined();
    expect(image3).not.toEqual(image1);
    expect(image3).toHaveProperty('id');
    expect(image3).toHaveProperty('data');
    expect(image3).toHaveProperty('createTime');
    const image4 = await imageService.getImage(image1.id);
    expect(image4).toBeDefined();
    expect(image4).toEqual(image3);

    // set invalid
    await expect(
      imageService.setImageData(image1.id, largeImage),
    ).rejects.toThrow(ServiceException);
    await expect(imageService.setImageData('', newImageData)).rejects.toThrow(
      ServiceException,
    );

    // delete
    await imageService.deleteImage(image1.id);
    await expect(imageService.getImage(image1.id)).rejects.toThrow(
      ServiceException,
    );
  });
});
