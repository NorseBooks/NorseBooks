import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { ImageService } from '../image/image.service';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { VerifyService } from '../verify/verify.service';
import { PasswordResetService } from '../password-reset/password-reset.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
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

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
