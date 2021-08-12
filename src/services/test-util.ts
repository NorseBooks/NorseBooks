import { Test, TestingModule } from '@nestjs/testing';
import { Abstract } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { ConfigModule } from '@nestjs/config';
import { DBService } from './db/db.service';
import { ResourceService } from './resource/resource.service';
import { ImageService } from './image/image.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { VerifyService } from './verify/verify.service';
import { PasswordResetService } from './password-reset/password-reset.service';

/**
 * Time in milliseconds to wait after each test.
 */
const afterTestsWaitTime = 100;

/**
 * Get an instance of a service.
 *
 * @param service The service class.
 * @returns The instance of the service.
 */
export async function getService<TInput = any, TResult = TInput>(
  service: Type<TInput> | Abstract<TInput> | string | symbol,
): Promise<TResult> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot()],
    providers: [
      DBService,
      ResourceService,
      ImageService,
      UserService,
      SessionService,
      VerifyService,
      PasswordResetService,
    ],
  }).compile();

  return module.get<TInput, TResult>(service);
}

/**
 * Wait after each test is done before jest teardown.
 */
export async function afterTestsWait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, afterTestsWaitTime));
}
