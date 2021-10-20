/**
 * User interest controller.
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
import { UserInterestService } from '../../services/user-interest/user-interest.service';
import { NBUserInterest } from '../../services/user-interest/user-interest.interface';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryNumber } from '../../decorators/query-number.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * User interest controller.
 */
@Controller('api/user-interest')
@UseInterceptors(new ResponseInterceptor())
export class UserInterestController {
  constructor(private readonly userInterestService: UserInterestService) {}

  /**
   * Note the user's interest in a department.
   *
   * @param departmentID The department's ID.
   * @param user The user.
   * @returns The new user interest.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async noteInterest(
    @QueryNumber({ name: 'departmentID' }) departmentID: number,
    @UserSession() user: NBUser,
  ): Promise<NBUserInterest> {
    return this.userInterestService.noteInterest(user.id, departmentID);
  }

  /**
   * Get whether or not the user is interested in the department.
   *
   * @param departmentID The department's ID.
   * @param user The user.
   * @returns Whether or not the user is interested in the department.
   */
  @Get('interested')
  @UseGuards(SessionRequiredGuard)
  public async isInterested(
    @QueryNumber({ name: 'departmentID' }) departmentID: number,
    @UserSession() user: NBUser,
  ): Promise<boolean> {
    return this.userInterestService.isInterested(user.id, departmentID);
  }

  /**
   * Get all of the user's interests.
   *
   * @param user The user.
   * @returns All of the user's interests.
   */
  @Get()
  @UseGuards(SessionRequiredGuard)
  public async getInterests(
    @UserSession() user: NBUser,
  ): Promise<NBUserInterest[]> {
    return this.userInterestService.getUserInterests(user.id);
  }

  /**
   * Delete a user's interest in a department.
   *
   * @param departmentID The department's ID.
   * @param user The user.
   */
  @Delete()
  @UseGuards(SessionRequiredGuard)
  public async dropInterest(
    @QueryNumber({ name: 'departmentID' }) departmentID: number,
    @UserSession() user: NBUser,
  ): Promise<void> {
    await this.userInterestService.dropInterest(user.id, departmentID);
  }
}
