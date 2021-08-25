import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { NBImage } from './image.interface';
import { ServiceException } from '../service.exception';
import * as jimp from 'jimp';

/**
 * Image table service.
 */
@Injectable()
export class ImageService {
  private readonly tableName = 'NB_IMAGE';

  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
  ) {}

  /**
   * Create a new image in the database.
   *
   * @param data The image data.
   * @returns The new image record.
   */
  public async createImage(data: string): Promise<NBImage> {
    const imageData = await this.shrinkImageBase64(data);

    const maxImageSize = await this.resourceService.getResource<number>(
      'MAX_IMAGE_SIZE',
    );

    if (imageData.length < maxImageSize) {
      return this.dbService.create<NBImage>(this.tableName, {
        data: imageData,
      });
    } else {
      throw new ServiceException('Image is too large');
    }
  }

  /**
   * Determine whether or not an image exists.
   *
   * @param imageID The ID of the image.
   * @returns Whether or not the image exists.
   */
  public async imageExists(imageID: string): Promise<boolean> {
    const image = await this.dbService.getByID<NBImage>(
      this.tableName,
      imageID,
    );
    return !!image;
  }

  /**
   * Get an image.
   *
   * @param imageID The ID of the image.
   * @returns The image record.
   */
  public async getImage(imageID: string): Promise<NBImage> {
    const image = await this.dbService.getByID<NBImage>(
      this.tableName,
      imageID,
    );

    if (image) {
      return image;
    } else {
      throw new ServiceException('Image does not exist');
    }
  }

  /**
   * Set an image's data.
   *
   * @param imageID The ID of the image.
   * @param newData The new image data.
   * @returns The updated image record.
   */
  public async setImageData(
    imageID: string,
    newData: string,
  ): Promise<NBImage> {
    const imageData = await this.shrinkImageBase64(newData);

    const maxImageSize = await this.resourceService.getResource<number>(
      'MAX_IMAGE_SIZE',
    );

    if (imageData.length < maxImageSize) {
      const imageExists = await this.imageExists(imageID);

      if (imageExists) {
        return this.dbService.updateByID<NBImage>(this.tableName, imageID, {
          data: imageData,
        });
      } else {
        throw new ServiceException('Image does not exist');
      }
    } else {
      throw new ServiceException('Image is too large');
    }
  }

  /**
   * Delete an image.
   *
   * @param imageID The ID of the image.
   */
  public async deleteImage(imageID: string): Promise<void> {
    await this.dbService.deleteByID(this.tableName, imageID);
  }

  /**
   * Shrink an image.
   *
   * @param image The image buffer.
   * @param factor The scale factor.
   * @param quality The JPEG quality.
   * @returns The resulting image buffer.
   */
  private async shrinkImage(
    image: Buffer,
    factor: number,
    quality = 100,
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      jimp.read(image).then((img) => {
        const width = img.bitmap.width;
        img
          .resize(Math.floor(width * factor), jimp.AUTO)
          .quality(quality)
          .getBufferAsync(jimp.MIME_JPEG)
          .then((buffer) => {
            resolve(buffer);
          });
      });
    });
  }

  /**
   * Shrink an image to a maximum size.
   *
   * @param image The image buffer.
   * @param maxWidth The maximum width of the image.
   * @param maxHeight The maximum height of the image.
   * @returns The resulting image buffer.
   */
  private async shrinkImageToSize(
    image: Buffer,
    maxWidth = 1920,
    maxHeight = 1080,
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      jimp.read(image).then((img) => {
        const existingRatio = img.bitmap.width / img.bitmap.height;
        const potentialRatio = maxWidth / maxHeight;
        if (existingRatio > potentialRatio) {
          img
            .resize(maxWidth, jimp.AUTO)
            .getBufferAsync(jimp.MIME_JPEG)
            .then((buffer) => {
              resolve(buffer);
            });
        } else {
          img
            .resize(jimp.AUTO, maxHeight)
            .getBufferAsync(jimp.MIME_JPEG)
            .then((buffer) => {
              resolve(buffer);
            });
        }
      });
    });
  }

  /**
   * Shrink an image automatically.
   *
   * @param image The image buffer.
   * @param maxImageSize The maximum size of the image.
   * @param factor The scale factor.
   * @param quality The JPEG quality.
   * @returns The resulting image buffer.
   */
  private async shrinkImageAuto(
    image: Buffer,
    maxImageSize: number,
    maxWidth = 1600,
    maxHeight = 900,
    factor = 0.7071,
    quality = 40,
  ): Promise<Buffer> {
    if (image.length < maxImageSize) {
      return image;
    } else {
      const buffer = await this.shrinkImageToSize(image, maxWidth, maxHeight);

      if (buffer.length * (4 / 3) < maxImageSize) {
        return buffer;
      } else {
        let newBuffer = await this.shrinkImage(buffer, factor, quality);

        while (newBuffer.length * (4 / 3) >= maxImageSize) {
          newBuffer = await this.shrinkImage(newBuffer, factor, quality);
        }

        return newBuffer;
      }
    }
  }

  /**
   * Shrinks a base64 encoded image.
   *
   * @param imageB64 The base64 image.
   * @returns The shrunk base64 image.
   */
  private async shrinkImageBase64(imageB64: string): Promise<string> {
    const maxImageSize = await this.resourceService.getResource<number>(
      'MAX_IMAGE_SIZE',
    );

    const image = Buffer.from(imageB64, 'base64');
    const shrunk = await this.shrinkImageAuto(image, maxImageSize);
    return shrunk.toString('base64');
  }
}
