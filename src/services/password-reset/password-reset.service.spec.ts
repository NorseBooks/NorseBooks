import { PasswordResetService } from './password-reset.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { UserService } from '../user/user.service';

describe('PasswordResetService', () => {
  let passwordResetService: PasswordResetService;
  let userService: UserService;

  beforeAll(async () => {
    passwordResetService = await getService(PasswordResetService);
    userService = await getService(UserService);
  });

  it('should create, check existence, and delete password resets', async () => {
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
    const passwordReset = await passwordResetService.createPasswordReset(
      user.id,
    );
    expect(passwordReset).toBeDefined();
    expect(passwordReset).toHaveProperty('id');
    expect(passwordReset).toHaveProperty('userID', user.id);
    expect(passwordReset).toHaveProperty('createTime');

    // check existence
    const passwordResetExists1 = await passwordResetService.passwordResetExists(
      passwordReset.id,
    );
    expect(passwordResetExists1).toBeTruthy();

    // check existence by user
    const passwordResetExists2 =
      await passwordResetService.passwordResetExistsByUserID(user.id);
    expect(passwordResetExists2).toBeTruthy();

    // delete
    await passwordResetService.deletePasswordReset(passwordReset.id);
    const passwordResetExists3 = await passwordResetService.passwordResetExists(
      passwordReset.id,
    );
    expect(passwordResetExists3).toBeFalsy();
    await userService.deleteUser(user.id);
  });

  it('should create, get, get all, reset password, and delete password resets', async () => {
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
    const passwordReset1 = await passwordResetService.createPasswordReset(
      user1.id,
    );
    expect(passwordReset1).toBeDefined();
    expect(passwordReset1).toHaveProperty('id');
    expect(passwordReset1).toHaveProperty('userID', user1.id);
    expect(passwordReset1).toHaveProperty('createTime');

    // get
    const passwordReset2 = await passwordResetService.getPasswordReset(
      passwordReset1.id,
    );
    expect(passwordReset2).toBeDefined();
    expect(passwordReset2).toEqual(passwordReset1);

    // get by user
    const passwordReset3 = await passwordResetService.getPasswordResetByUserID(
      user1.id,
    );
    expect(passwordReset3).toBeDefined();
    expect(passwordReset3).toEqual(passwordReset1);

    // get all
    const passwordResets = await passwordResetService.getPasswordResets();
    expect(passwordResets).toBeDefined();
    expect(passwordResets.length).toBe(1);

    // reset password
    const newPassword = 'password456';
    await passwordResetService.resetPassword(passwordReset1.id, newPassword);
    const user2 = await userService.getUser(user1.id);
    expect(user2).toBeDefined();
    expect(user2.passwordHash).not.toBe(user1.passwordHash);
    await expect(userService.login(email, password)).rejects.toThrow(
      ServiceException,
    );
    await userService.login(email, newPassword);
    await expect(
      passwordResetService.resetPassword(passwordReset1.id, newPassword),
    ).rejects.toThrow(ServiceException);

    // delete
    await passwordResetService.deletePasswordReset(passwordReset1.id);
    await expect(
      passwordResetService.getPasswordReset(passwordReset1.id),
    ).rejects.toThrow(ServiceException);
    await userService.deleteUser(user1.id);
  });

  it('should create, get reset by user, get user by reset, and delete password resets', async () => {
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
    const passwordReset1 = await passwordResetService.createPasswordReset(
      user1.id,
    );
    expect(passwordReset1).toBeDefined();
    expect(passwordReset1).toHaveProperty('id');
    expect(passwordReset1).toHaveProperty('userID', user1.id);
    expect(passwordReset1).toHaveProperty('createTime');

    // get reset by user
    const passwordReset2 = await passwordResetService.getPasswordResetByUserID(
      user1.id,
    );
    expect(passwordReset2).toBeDefined();
    expect(passwordReset2).toEqual(passwordReset1);

    // get user by reset
    const user2 = await passwordResetService.getUserByPasswordReset(
      passwordReset1.id,
    );
    expect(user2).toBeDefined();
    expect(user2).toEqual(user1);

    // delete
    await passwordResetService.deletePasswordReset(passwordReset1.id);
    const passwordResetExists = await passwordResetService.passwordResetExists(
      passwordReset1.id,
    );
    expect(passwordResetExists).toBeFalsy();
    await userService.deleteUser(user1.id);
  });
});
