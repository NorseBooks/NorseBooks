import { ImageService } from '../image/image.service';
import { getService, afterTestsWait } from '../test-util';

describe('ImageService', () => {
  let imageService: ImageService;

  beforeEach(async () => {
    imageService = await getService(ImageService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(imageService).toBeDefined();
  });
});
