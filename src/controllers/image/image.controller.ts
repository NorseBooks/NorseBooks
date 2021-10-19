/**
 * Image controller.
 * @packageDocumentation
 */

import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from '../../services/image/image.service';

/**
 * Image controller.
 */
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Get a raw image.
   *
   * @param imageID The image's ID.
   * @param res The response object.
   * @returns The image in a binary format.
   */
  @Get(':imageID')
  public async getImage(
    @Param('imageID') imageID: string,
    @Res() res: Response,
  ): Promise<void> {
    return new Promise(async (resolve) => {
      const image = await this.imageService.getImage(imageID);
      const imageData = Buffer.from(image.data, 'base64');

      return res
        .writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': imageData.length,
        })
        .end(imageData, resolve);
    });
  }
}
