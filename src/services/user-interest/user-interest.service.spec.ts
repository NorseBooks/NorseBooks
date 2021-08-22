import { UserInterestService } from './user-interest.service';
import { UserService } from '../user/user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';

describe('UserInterestService', () => {
  let userInterestService: UserInterestService;
  let userService: UserService;
  let user: NBUser;

  const firstname = 'Martin';
  const lastname = 'Luther';
  const email = 'luthma01@luther.edu';
  const password = 'password123';

  beforeAll(async () => {
    userInterestService = await getService(UserInterestService);
    userService = await getService(UserService);
  });

  beforeEach(async () => {
    user = await userService.createUser(firstname, lastname, email, password);
  });

  afterEach(async () => {
    await userService.deleteUser(user.id);
  });

  it('should be defined', () => {
    expect(userInterestService).toBeDefined();
  });

  it('should note interest, check if interested, and drop interest', async () => {
    // note interest
    const departmentID = 15;
    const userInterest1 = await userInterestService.noteInterest(
      user.id,
      departmentID,
    );
    expect(userInterest1).toBeDefined();
    expect(userInterest1).toHaveProperty('userID', user.id);
    expect(userInterest1).toHaveProperty('departmentID', departmentID);
    expect(userInterest1).toHaveProperty('interestTime');

    // note same interest
    const userInterest2 = await userInterestService.noteInterest(
      user.id,
      departmentID,
    );
    expect(userInterest2).toBeDefined();
    expect(userInterest2).not.toEqual(userInterest1);
    expect(userInterest2).toHaveProperty('userID', user.id);
    expect(userInterest2).toHaveProperty('departmentID', departmentID);
    expect(userInterest2).toHaveProperty('interestTime');
    expect(userInterest2.interestTime).not.toEqual(userInterest1.interestTime);

    // note interest in invalid department
    await expect(userInterestService.noteInterest(user.id, -1)).rejects.toThrow(
      ServiceException,
    );

    // check if interested
    const interested1 = await userInterestService.isInterested(
      user.id,
      departmentID,
    );
    expect(interested1).toBeTruthy();
    const interested2 = await userInterestService.isInterested(user.id, 41);
    expect(interested2).toBeFalsy();

    // drop interest
    await userInterestService.dropInterest(user.id, departmentID);
    const interested3 = await userInterestService.isInterested(
      user.id,
      departmentID,
    );
    expect(interested3).toBeFalsy();
  });

  it('should note interest, get user interests, and drop interest', async () => {
    // note interest
    const departmentID1 = 17;
    const userInterest1 = await userInterestService.noteInterest(
      user.id,
      departmentID1,
    );
    expect(userInterest1).toBeDefined();
    expect(userInterest1).toHaveProperty('userID', user.id);
    expect(userInterest1).toHaveProperty('departmentID', departmentID1);
    expect(userInterest1).toHaveProperty('interestTime');
    const departmentID2 = 36;
    const userInterest2 = await userInterestService.noteInterest(
      user.id,
      departmentID2,
    );
    expect(userInterest2).toBeDefined();
    expect(userInterest2).toHaveProperty('userID', user.id);
    expect(userInterest2).toHaveProperty('departmentID', departmentID2);
    expect(userInterest2).toHaveProperty('interestTime');

    // get interests
    const userInterests1 = await userInterestService.getUserInterests(user.id);
    expect(userInterests1).toBeDefined();
    expect(userInterests1.length).toBe(2);
    expect(userInterests1).toEqual([userInterest1, userInterest2]);
    const userInterest3 = await userInterestService.noteInterest(
      user.id,
      departmentID1,
    );
    expect(userInterest3).toBeDefined();
    expect(userInterest3).toHaveProperty('userID', user.id);
    expect(userInterest3).toHaveProperty('departmentID', departmentID1);
    expect(userInterest3).toHaveProperty('interestTime');
    const userInterests2 = await userInterestService.getUserInterests(user.id);
    expect(userInterests2).toBeDefined();
    expect(userInterests2.length).toBe(2);
    expect(userInterests2).toEqual([userInterest2, userInterest3]);

    // drop interests
    await userInterestService.dropInterest(user.id, departmentID1);
    const userInterests3 = await userInterestService.getUserInterests(user.id);
    expect(userInterests3).toBeDefined();
    expect(userInterests3.length).toBe(1);
    expect(userInterests3).toEqual([userInterest2]);
    await userInterestService.dropInterest(user.id, departmentID2);
    const userInterests4 = await userInterestService.getUserInterests(user.id);
    expect(userInterests4).toBeDefined();
    expect(userInterests4.length).toBe(0);
  });
});
