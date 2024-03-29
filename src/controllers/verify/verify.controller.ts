/**
 * Verify controller.
 * @packageDocumentation
 */

import { Controller, UseInterceptors, Patch } from '@nestjs/common';
import { VerifyService } from '../../services/verify/verify.service';
import { QueryString } from '../../decorators/query-string.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Verify controller.
 */
@Controller('api/verify')
@UseInterceptors(new ResponseInterceptor())
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  /**
   * Verify a user's account.
   *
   * @param verifyID The verification ID.
   */
  @Patch()
  public async verify(
    @QueryString({ name: 'verifyID' }) verifyID: string,
  ): Promise<void> {
    await this.verifyService.verifyUser(verifyID);
  }
}
