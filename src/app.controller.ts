import { Controller, UseGuards, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserSessionOptionalGuard } from './guards/user-session-optional.guard';
import { UserSession } from './decorators/user-session.decorator';
import { NBUser } from './services/user/user.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('user')
  @UseGuards(UserSessionOptionalGuard)
  public getHello(@UserSession() user: NBUser): { res: NBUser } {
    return { res: user };
  }
}
