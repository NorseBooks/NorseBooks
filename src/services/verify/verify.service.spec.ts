import { VerifyService } from './verify.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { UserService } from '../user/user.service';

describe('VerifyService', () => {
  let verifyService: VerifyService;
  let userService: UserService;

  beforeAll(async () => {
    verifyService = await getService(VerifyService);
    userService = await getService(UserService);
  });

  it('should be defined', () => {
    expect(verifyService).toBeDefined();
  });

  it('should create, check existence, and delete verifications', async () => {
    // create
    const firstname = 'Martin';
    const lastname = 'Luther';
    const email = 'luthma01@luther.edu';
    const password = 'password123';
    const user = await userService.createUser(
      firstname,
      lastname,
      email,
      password,
    );
    const verification = await verifyService.createVerification(user.id);
    expect(verification).toBeDefined();
    expect(verification).toHaveProperty('id');
    expect(verification).toHaveProperty('userID', user.id);
    expect(verification).toHaveProperty('createTime');

    // check existence
    const verificationExists1 = await verifyService.verificationExists(
      verification.id,
    );
    expect(verificationExists1).toBe(true);

    // check existence by user
    const verificationExists2 = await verifyService.verificationExistsByUserID(
      user.id,
    );
    expect(verificationExists2).toBe(true);

    // delete
    await verifyService.deleteVerification(verification.id);
    const verificationExists3 = await verifyService.verificationExists(
      verification.id,
    );
    expect(verificationExists3).toBe(false);
    await userService.deleteUser(user.id);
  });

  it('should create, get, get all, verify, and delete verifications', async () => {
    // create
    const firstname = 'Martin';
    const lastname = 'Luther';
    const email = 'luthma01@luther.edu';
    const password = 'password123';
    const user1 = await userService.createUser(
      firstname,
      lastname,
      email,
      password,
    );
    expect(user1).toBeDefined();
    expect(user1.verified).toBe(false);
    const verification1 = await verifyService.createVerification(user1.id);
    expect(verification1).toBeDefined();
    expect(verification1).toHaveProperty('id');
    expect(verification1).toHaveProperty('userID', user1.id);
    expect(verification1).toHaveProperty('createTime');

    // get
    const verification2 = await verifyService.getVerification(verification1.id);
    expect(verification2).toBeDefined();
    expect(verification2).toEqual(verification1);

    // get by user
    const verification3 = await verifyService.getVerificationByUserID(user1.id);
    expect(verification3).toBeDefined();
    expect(verification3).toEqual(verification1);

    // get all
    const verifications = await verifyService.getVerifications();
    expect(verifications).toBeDefined();
    expect(verifications.length).toBe(1);

    // verify
    await verifyService.verifyUser(verification1.id);
    const user2 = await userService.getUser(user1.id);
    expect(user2).toBeDefined();
    expect(user2.verified).toBe(true);
    await expect(verifyService.verifyUser(verification1.id)).rejects.toThrow(
      ServiceException,
    );

    // delete
    await verifyService.deleteVerification(verification1.id);
    await expect(
      verifyService.getVerification(verification1.id),
    ).rejects.toThrow(ServiceException);
    await userService.deleteUser(user1.id);
  });

  it('should create, get verification by user, get user by verification, and delete unverified users', async () => {
    // create
    const firstname = 'Martin';
    const lastname = 'Luther';
    const email = 'luthma01@luther.edu';
    const password = 'password123';
    const user1 = await userService.createUser(
      firstname,
      lastname,
      email,
      password,
    );
    const verification1 = await verifyService.createVerification(user1.id);
    expect(verification1).toBeDefined();
    expect(verification1).toHaveProperty('id');
    expect(verification1).toHaveProperty('userID', user1.id);
    expect(verification1).toHaveProperty('createTime');

    // get verification by user
    const verification2 = await verifyService.getVerificationByUserID(user1.id);
    expect(verification2).toBeDefined();
    expect(verification2).toEqual(verification1);

    // get user by verification
    const user2 = await verifyService.getUserByVerification(verification1.id);
    expect(user2).toBeDefined();
    expect(user2).toEqual(user1);

    // delete unverified
    await verifyService.deleteUnverifiedUser(verification1.id);
    const verificationExists = await verifyService.verificationExists(
      verification1.id,
    );
    expect(verificationExists).toBe(false);
    const userExists = await userService.userExists(user1.id);
    expect(userExists).toBe(false);
  });
});
