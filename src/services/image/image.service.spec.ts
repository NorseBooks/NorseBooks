import { ImageService } from '../image/image.service';
import { getService } from '../test-util';

describe('ImageService', () => {
  let imageService: ImageService;

  beforeAll(async () => {
    imageService = await getService(ImageService);
  });

  it('should be defined', () => {
    expect(imageService).toBeDefined();
  });
});
