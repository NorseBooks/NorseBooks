import { UserService } from './user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('UserService', () => {
  let userService: UserService;

  beforeAll(async () => {
    userService = await getService(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should create, check existence, get, and delete a user', async () => {
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
    expect(user1).toHaveProperty('id');
    expect(user1).toHaveProperty('firstname', firstname);
    expect(user1).toHaveProperty('lastname', lastname);
    expect(user1).toHaveProperty('email', email);
    expect(user1).toHaveProperty('passwordHash');
    expect(user1).toHaveProperty('imageID', null);
    expect(user1).toHaveProperty('numBooksListed', 0);
    expect(user1).toHaveProperty('numBooksSold', 0);
    expect(user1).toHaveProperty('moneyMade', 0);
    expect(user1).toHaveProperty('verified', false);
    expect(user1).toHaveProperty('admin', false);
    expect(user1).toHaveProperty('joinTime');
    expect(user1).toHaveProperty('lastLoginTime', null);

    // check existence
    const userExists1 = await userService.userExists(user1.id);
    expect(userExists1).toBeTruthy();

    // check existence by email
    const userExists2 = await userService.userExistsByEmail(email);
    expect(userExists2).toBeTruthy();

    // get
    const user2 = await userService.getUser(user1.id);
    expect(user2).toBeDefined();
    expect(user2).toEqual(user1);

    // get by email
    const user3 = await userService.getUserByEmail(email);
    expect(user3).toBeDefined();
    expect(user3).toEqual(user1);

    // delete
    await userService.deleteUser(user1.id);
    const userExists3 = await userService.userExists(user1.id);
    expect(userExists3).toBeFalsy();
    await expect(userService.getUser(user1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should create, set password/verified/image, delete image, and delete a user', async () => {
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
    expect(user1).toHaveProperty('id');
    expect(user1).toHaveProperty('firstname', firstname);
    expect(user1).toHaveProperty('lastname', lastname);
    expect(user1).toHaveProperty('email', email);
    expect(user1).toHaveProperty('passwordHash');
    expect(user1).toHaveProperty('imageID', null);
    expect(user1).toHaveProperty('numBooksListed', 0);
    expect(user1).toHaveProperty('numBooksSold', 0);
    expect(user1).toHaveProperty('moneyMade', 0);
    expect(user1).toHaveProperty('verified', false);
    expect(user1).toHaveProperty('admin', false);
    expect(user1).toHaveProperty('joinTime');
    expect(user1).toHaveProperty('lastLoginTime', null);

    // set password
    const newPassword = 'password456';
    const user2 = await userService.setPassword(user1.id, newPassword);
    expect(user2).toBeDefined();
    expect(user2.id).toBe(user1.id);
    expect(user2.passwordHash).not.toBe(user1.passwordHash);
    const user3 = await userService.getUser(user1.id);
    expect(user3).toBeDefined();
    expect(user3).toEqual(user2);

    // set verified
    const user4 = await userService.setVerified(user1.id);
    expect(user4).toBeDefined();
    expect(user4.id).toBe(user1.id);
    expect(user4.verified).toBeTruthy();
    const user5 = await userService.getUser(user1.id);
    expect(user5).toBeDefined();
    expect(user5).toEqual(user4);

    // set image
    const imageData = 'abc';
    const user6 = await userService.setUserImage(user1.id, imageData);
    expect(user6).toBeDefined();
    expect(user6.id).toBe(user1.id);
    expect(user6.imageID).toBeDefined();
    expect(user6.imageID).not.toBeNull();
    const user7 = await userService.getUser(user1.id);
    expect(user7).toBeDefined();
    expect(user7).toEqual(user6);

    // delete image
    const user8 = await userService.deleteUserImage(user1.id);
    expect(user8).toBeDefined();
    expect(user8.id).toBe(user1.id);
    expect(user8.imageID).toBeNull();
    const user9 = await userService.getUser(user1.id);
    expect(user9).toBeDefined();
    expect(user9).toEqual(user8);

    // delete
    await userService.deleteUser(user1.id);
    const userExists = await userService.userExists(user1.id);
    expect(userExists).toBeFalsy();
    await expect(userService.getUser(user1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should create, login, and delete a user', async () => {
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
    expect(user1).toHaveProperty('id');
    expect(user1).toHaveProperty('firstname', firstname);
    expect(user1).toHaveProperty('lastname', lastname);
    expect(user1).toHaveProperty('email', email);
    expect(user1).toHaveProperty('passwordHash');
    expect(user1).toHaveProperty('imageID', null);
    expect(user1).toHaveProperty('numBooksListed', 0);
    expect(user1).toHaveProperty('numBooksSold', 0);
    expect(user1).toHaveProperty('moneyMade', 0);
    expect(user1).toHaveProperty('verified', false);
    expect(user1).toHaveProperty('admin', false);
    expect(user1).toHaveProperty('joinTime');
    expect(user1).toHaveProperty('lastLoginTime', null);

    // login
    const session = await userService.login(email, password);
    expect(session).toBeDefined();
    const user2 = await userService.getUser(user1.id);
    expect(user2).toBeDefined();
    expect(user2.lastLoginTime).toBeDefined();
    expect(user2.lastLoginTime).not.toBeNull();
    await expect(userService.login(email, 'wrong-password')).rejects.toThrow(
      ServiceException,
    );

    // delete
    await userService.deleteUser(user1.id);
    const userExists = await userService.userExists(user1.id);
    expect(userExists).toBeFalsy();
    await expect(userService.getUser(user1.id)).rejects.toThrow(
      ServiceException,
    );
  });
});
