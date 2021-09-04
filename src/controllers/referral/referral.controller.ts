/**
 * Referral controller.
 * @packageDocumentation
 */

import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
} from '@nestjs/common';
import { ReferralService } from '../../services/referral/referral.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Referral controller.
 */
@Controller('api/referral')
@UseInterceptors(new ResponseInterceptor())
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /**
   * Refer a user.
   *
   * @param userID The user's ID.
   * @param user The user.
   * @returns The new referral.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async referUser(
    @QueryString({ name: 'userID' }) userID: string,
    @UserSession() user: NBUser,
  ) {
    return this.referralService.referUser(userID, user.id);
  }

  /**
   * Get the user's referral record.
   *
   * @param user The user.
   * @returns The user referral.
   */
  @Get()
  @UseGuards(SessionRequiredGuard)
  public async getReferral(@UserSession() user: NBUser) {
    return this.referralService.getReferral(user.id);
  }

  /**
   * Get all referrals associated with a user.
   *
   * @param userID The user's ID.
   * @returns All referral records associated with the user.
   */
  @Get('user-referrals')
  @UseGuards(AdminGuard)
  public async getReferrals(@QueryString({ name: 'userID' }) userID: string) {
    return this.referralService.getReferrals(userID);
  }

  /**
   * Get whether or not the user has reached the referral threshold.
   *
   * @param user The user.
   * @returns Whether or not the user has reached the referral threshold.
   */
  @Get('reached-threshold')
  @UseGuards(SessionRequiredGuard)
  public async reachedReferralThreshold(@UserSession() user: NBUser) {
    return this.referralService.reachedReferralThreshold(user.id);
  }
}
