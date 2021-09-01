import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Patch,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { SessionService } from '../../services/session/session.service';
import { VerifyService } from '../../services/verify/verify.service';
import { SessionOptionalGuard } from '../../guards/session-optional.guard';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { Cookie } from '../../decorators/cookie.decorator';
import { Hostname } from 'src/decorators/hostname.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';
import { sendFormattedEmail } from '../../emailer';

/**
 * User controller.
 */
@Controller('api/user')
@UseInterceptors(new ResponseInterceptor())
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly verifyService: VerifyService,
  ) {}

  /**
   * Register an account.
   *
   * @param firstname The user's first name.
   * @param lastname The user's last name.
   * @param email The user's email address.
   * @param password The user's password.
   */
  @Post('register')
  public async register(
    @QueryString({ name: 'firstname' }) firstname: string,
    @QueryString({ name: 'lastname' }) lastname: string,
    @QueryString({ name: 'email' }) email: string,
    @QueryString({ name: 'password' }) password: string,
    @Hostname() hostname: string,
  ) {
    const user = await this.userService.createUser(
      firstname,
      lastname,
      email,
      password,
    );
    const verification = await this.verifyService.createVerification(user.id);

    await sendFormattedEmail(user.email, 'Verify account', 'verify', {
      hostname,
      verifyID: verification.id,
    });
  }

  /**
   * Log in.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @param res The response object.
   */
  @Post('login')
  public async login(
    @QueryString({ name: 'email' }) email: string,
    @QueryString({ name: 'password' }) password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.userService.login(email, password);
    res.cookie('sessionID', session.id);
  }

  /**
   * Log out.
   *
   * @param sessionID The sessionID.
   */
  @Delete('logout')
  public async logout(
    @Cookie('sessionID') sessionID: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (sessionID) {
      await this.sessionService.deleteSession(sessionID);
    }

    res.clearCookie('sessionID');
  }

  /**
   * Log out everywhere.
   *
   * @param user The user.
   * @param res The response object.
   */
  @Delete('logout-everywhere')
  @UseGuards(SessionOptionalGuard)
  public async logoutEverywhere(
    @UserSession() user: NBUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (user) {
      await this.sessionService.deleteUserSessions(user.id);
    }

    res.clearCookie('sessionID');
  }

  /**
   * Get the logged in user's details.
   *
   * @param user The user.
   * @returns The user's info.
   */
  @Get()
  @UseGuards(SessionRequiredGuard)
  public async getUserInfo(@UserSession() user: NBUser) {
    const userInfo = await this.userService.getUser(user.id);

    return {
      id: userInfo.id,
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      email: userInfo.email,
      imageID: userInfo.imageID,
      numBooksListed: userInfo.numBooksListed,
      numBooksSold: userInfo.numBooksSold,
      moneyMade: userInfo.moneyMade,
      joinTime: userInfo.joinTime,
    };
  }

  /**
   * Get a user's details.
   *
   * @param userID The user's ID.
   * @returns The user's info.
   */
  @Get('other')
  public async getOtherUserInfo(
    @QueryString({ name: 'userID' }) userID: string,
  ) {
    const userInfo = await this.userService.getUser(userID);

    return {
      id: userInfo.id,
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      imageID: userInfo.imageID,
      joinTime: userInfo.joinTime,
    };
  }

  /**
   * Get all books listed by the user.
   *
   * @param user The user.
   * @returns The user's currently listed books.
   */
  @Get('books')
  @UseGuards(SessionRequiredGuard)
  public async getCurrentBooks(@UserSession() user: NBUser) {
    return this.userService.getCurrentBooks(user.id);
  }

  /**
   * Set the user's password.
   *
   * @param newPassword The new password.
   * @param user The user.
   */
  @Patch('password')
  @UseGuards(SessionRequiredGuard)
  public async setPassword(
    @QueryString({ name: 'newPassword' }) newPassword: string,
    @UserSession() user: NBUser,
  ) {
    await this.userService.setPassword(user.id, newPassword);
  }

  /**
   * Set the user's image.
   *
   * @param imageData The image data.
   * @param user The user.
   */
  @Patch('image')
  @UseGuards(SessionRequiredGuard)
  public async setImage(
    @QueryString({ name: 'imageData', scope: 'body' }) imageData: string,
    @UserSession() user: NBUser,
  ) {
    await this.userService.setUserImage(user.id, imageData);
  }

  /**
   * Delete the user's image.
   *
   * @param user The user.
   */
  @Delete('image')
  @UseGuards(SessionRequiredGuard)
  public async deleteImage(@UserSession() user: NBUser) {
    await this.userService.deleteUserImage(user.id);
  }

  /**
   * Get recommended books for the user.
   *
   * @param user The user.
   * @returns The recommended books.
   */
  @Get('recommendations')
  @UseGuards(SessionRequiredGuard)
  public async getRecommendations(@UserSession() user: NBUser) {
    return this.userService.recommendations(user.id);
  }
}
