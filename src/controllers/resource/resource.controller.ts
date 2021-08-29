import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { ResourceService } from '../../services/resource/resource.service';
import { UserSessionRequiredGuard } from '../../guards/user-session-required.guard';
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

  @Get('exists')
  public async resourceExists(@QueryString('name') name: string) {
    return this.resourceService.resourceExists(name);
  }

  @Get()
  public async getResource(@QueryString('name') name: string) {
    return this.resourceService.getResource(name);
  }

  @Patch()
  @UseGuards(UserSessionRequiredGuard)
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

  @Get('all')
  public async getResources() {
    return this.resourceService.getResources();
  }
}
