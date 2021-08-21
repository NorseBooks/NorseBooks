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
import { DepartmentService } from './department/department.service';
import { BookConditionService } from './book-condition/book-condition.service';
import { MessageService } from './message/message.service';
import { SearchSortService } from './search-sort/search-sort.service';

/**
 * Time in milliseconds to wait before and after each test.
 */
const testWaitTime = 0;

/**
 * Wait asynchronously.
 *
 * @param ms The amount of time to wait in milliseconds.
 */
async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get an instance of a service.
 *
 * @param serviceType The service class.
 * @returns The instance of the service.
 */
export async function getService<TInput = any, TResult = TInput>(
  serviceType: Type<TInput> | Abstract<TInput> | string | symbol,
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
      DepartmentService,
      BookConditionService,
      MessageService,
      SearchSortService,
    ],
  }).compile();

  const service = module.get<TInput, TResult>(serviceType);

  await wait(testWaitTime);

  return service;
}

/**
 * Wait after each test is done before jest teardown.
 */
export async function afterTestsWait(): Promise<void> {
  await wait(testWaitTime);
}
