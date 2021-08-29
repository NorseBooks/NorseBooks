import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { ResourceService } from '../../services/resource/resource.service';
import { AdminGuard } from '../../guards/admin.guard';
import { UserSession } from '../../decorators/user-session.decorator';
import { QueryString } from '../../decorators/query-string.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

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
   * @param user The logged in user.
   * @param name The resource name.
   * @param value The new resource value.
   * @returns The updated resource.
   */
  @Patch()
  @UseGuards(AdminGuard)
  public async setResource(
    @UserSession() user: NBUser,
    @QueryString('name') name: string,
    @QueryString('value') value: string,
  ) {
    if (user.admin) {
      return this.resourceService.setResource(name, value);
    } else {
      throw new ForbiddenException();
    }
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
