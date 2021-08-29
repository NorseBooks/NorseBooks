import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Patch,
} from '@nestjs/common';
import { ResourceService } from '../../services/resource/resource.service';
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
  public async resourceExists(@QueryString('name') name: string) {
    return this.resourceService.resourceExists(name);
  }

  /**
   * Get a resource.
   *
   * @param name The resource name.
   * @returns The requested resource.
   */
  @Get()
  public async getResource(@QueryString('name') name: string) {
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
    @QueryString('name') name: string,
    @QueryString('value') value: string,
  ) {
    return this.resourceService.setResource(name, value);
  }

  /**
   * Get all resources.
   *
   * @returns All resources.
   */
  @Get('all')
  public async getResources() {
    return this.resourceService.getResources();
  }
}
