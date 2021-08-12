import { ImageService } from '../image/image.service';
import { getService, afterTestsWait } from '../test-util';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(async () => {
    service = await getService(ImageService);
  });

  afterAll(afterTestsWait);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
