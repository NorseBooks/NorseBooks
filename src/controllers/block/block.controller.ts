/**
 * User blocking controller.
 * @packageDocumentation
 */

import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Delete,
} from '@nestjs/common';
import { BlockService } from '../../services/block/block.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from 'src/decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * User blocking controller.
 */
@Controller('api/block')
@UseInterceptors(new ResponseInterceptor())
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  /**
   * Block a user.
   *
   * @param blockedUserID The ID of the user being blocked.
   * @param user The user.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async blockUser(
    @QueryString({ name: 'userID' }) blockedUserID: string,
    @UserSession() user: NBUser,
  ) {
    await this.blockService.blockUser(user.id, blockedUserID);
  }

  /**
   * Unblock a user.
   *
   * @param blockedUserID The ID of the blocked user.
   * @param user The user.
   */
  @Delete()
  @UseGuards(SessionRequiredGuard)
  public async unblockUser(
    @QueryString({ name: 'userID' }) blockedUserID: string,
    @UserSession() user: NBUser,
  ) {
    await this.blockService.unblockUser(user.id, blockedUserID);
  }

  /**
   * Get whether or not a user is blocked.
   *
   * @param blockedUserID The ID of the blocked user.
   * @param user The user.
   * @returns Whether or not the user is blocked.
   */
  @Get('blocked')
  @UseGuards(SessionRequiredGuard)
  public async isBlocked(
    @QueryString({ name: 'userID' }) blockedUserID: string,
    @UserSession() user: NBUser,
  ) {
    return this.blockService.isBlocked(user.id, blockedUserID);
  }

  /**
   * Get all blocked users.
   *
   * @param user The user.
   * @returns All blocked users.
   */
  @Get('blocked-users')
  @UseGuards(SessionRequiredGuard)
  public async getBlockedUsers(@UserSession() user: NBUser) {
    const users = await this.blockService.getBlockedUsers(user.id);

    return users.map((user) => ({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      imageID: user.imageID,
      joinTime: user.joinTime,
    }));
  }
}
