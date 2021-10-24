/**
 * Resource controller.
 * @packageDocumentation
 */

import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Patch,
} from '@nestjs/common';
import { ResourceService } from '../../services/resource/resource.service';
import {
  NBResource,
  ResourceMap,
} from '../../services/resource/resource.interface';
import { AdminGuard } from '../../guards/admin.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Resource controller.
 */
@Controller('api/resource')
@UseInterceptors(new ResponseInterceptor())
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  /**
   * Check if a resource exists.
   *
   * @param name The resource name.
   * @returns Whether or not the resource exists.
   */
  @Get('exists')
  public async resourceExists(
    @QueryString({ name: 'name' }) name: string,
  ): Promise<boolean> {
    return this.resourceService.resourceExists(name);
  }

  /**
   * Get a resource.
   *
   * @param name The resource name.
   * @returns The requested resource.
   */
  @Get()
  public async getResource(
    @QueryString({ name: 'name' }) name: string,
  ): Promise<boolean | number | string> {
    return this.resourceService.getResource(name);
  }

  /**
   * Set a resource's value.
   *
   * @param name The resource name.
   * @param value The new resource value.
   * @returns The updated resource.
   */
  @Patch()
  @UseGuards(AdminGuard)
  public async setResource(
    @QueryString({ name: 'name' }) name: string,
    @QueryString({ name: 'value' }) value: string,
  ): Promise<NBResource<boolean | number | string>> {
    return this.resourceService.setResource(name, value);
  }

  /**
   * Reset a resource's value.
   *
   * @param name The resource name.
   * @returns The updated resource.
   */
  @Patch('reset')
  @UseGuards(AdminGuard)
  public async resetResource(
    @QueryString({ name: 'name' }) name: string,
  ): Promise<NBResource<boolean | number | string>> {
    return this.resourceService.resetResource(name);
  }

  /**
   * Get all resources.
   *
   * @returns All resources.
   */
  @Get('all')
  public async getResources(): Promise<ResourceMap> {
    return this.resourceService.getResources();
  }
}
