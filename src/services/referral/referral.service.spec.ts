import { ReferralService } from './referral.service';
import { UserService } from '../user/user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';

describe('ReferralService', () => {
  let referralService: ReferralService;
  let userService: UserService;
  let user1: NBUser;
  let user2: NBUser;
  let user3: NBUser;

  const firstname = 'Martin';
  const lastname = 'Luther';
  const email1 = 'luthma01@luther.edu';
  const email2 = 'luthma02@luther.edu';
  const email3 = 'luthma03@luther.edu';
  const password = 'password123';

  beforeAll(async () => {
    referralService = await getService(ReferralService);
    userService = await getService(UserService);
  });

  beforeEach(async () => {
    user1 = await userService.createUser(firstname, lastname, email1, password);
    user2 = await userService.createUser(firstname, lastname, email2, password);
    user3 = await userService.createUser(firstname, lastname, email3, password);
  });

  afterEach(async () => {
    await userService.deleteUser(user1.id);
    await userService.deleteUser(user2.id);
    await userService.deleteUser(user3.id);
  });

  it('should be defined', () => {
    expect(referralService).toBeDefined();
  });

  it('should refer, get referral, get referrals, and delete referrals', async () => {
    // refer
    const referral1 = await referralService.referUser(user1.id, user2.id);
    expect(referral1).toBeDefined();
    expect(referral1).toHaveProperty('userID', user1.id);
    expect(referral1).toHaveProperty('newUserID', user2.id);
    expect(referral1).toHaveProperty('referTime');
    const referral2 = await referralService.referUser(user1.id, user3.id);
    expect(referral2).toBeDefined();
    expect(referral2).toHaveProperty('userID', user1.id);
    expect(referral2).toHaveProperty('newUserID', user3.id);
    expect(referral2).toHaveProperty('referTime');
    await expect(referralService.referUser(user2.id, user3.id)).rejects.toThrow(
      ServiceException,
    );

    // get referral
    const referral3 = await referralService.getReferral(user1.id);
    expect(referral3).not.toBeDefined();
    const referral4 = await referralService.getReferral(user2.id);
    expect(referral4).toBeDefined();
    expect(referral4).toEqual(referral1);
    const referral5 = await referralService.getReferral(user3.id);
    expect(referral5).toBeDefined();
    expect(referral5).toEqual(referral2);

    // get referrals
    const referrals1 = await referralService.getReferrals(user1.id);
    expect(referrals1).toBeDefined();
    expect(referrals1.length).toBe(2);
    expect(referrals1).toEqual([referral1, referral2]);
    const referrals2 = await referralService.getReferrals(user2.id);
    expect(referrals2).toBeDefined();
    expect(referrals2.length).toBe(0);
    const referrals3 = await referralService.getReferrals(user3.id);
    expect(referrals3).toBeDefined();
    expect(referrals3.length).toBe(0);

    // delete
    await referralService.deleteReferral(user1.id, user2.id);
    await referralService.deleteReferral(user1.id, user3.id);
    const referral6 = await referralService.getReferral(user1.id);
    expect(referral6).not.toBeDefined();
    const referral7 = await referralService.getReferral(user2.id);
    expect(referral7).not.toBeDefined();
    const referral8 = await referralService.getReferral(user3.id);
    expect(referral8).not.toBeDefined();
    const referrals4 = await referralService.getReferrals(user1.id);
    expect(referrals4).toBeDefined();
    expect(referrals4.length).toBe(0);
    const referrals5 = await referralService.getReferrals(user2.id);
    expect(referrals5).toBeDefined();
    expect(referrals5.length).toBe(0);
    const referrals6 = await referralService.getReferrals(user3.id);
    expect(referrals6).toBeDefined();
    expect(referrals6.length).toBe(0);
  });

  it('should refer, check referral threshold, and delete user referrals', async () => {
    // refer
    const referral1 = await referralService.referUser(user1.id, user2.id);
    expect(referral1).toBeDefined();
    expect(referral1).toHaveProperty('userID', user1.id);
    expect(referral1).toHaveProperty('newUserID', user2.id);
    expect(referral1).toHaveProperty('referTime');
    const referral2 = await referralService.referUser(user1.id, user3.id);
    expect(referral2).toBeDefined();
    expect(referral2).toHaveProperty('userID', user1.id);
    expect(referral2).toHaveProperty('newUserID', user3.id);
    expect(referral2).toHaveProperty('referTime');

    // check referral threshold
    const reachedThreshold1 = await referralService.reachedReferralThreshold(
      user1.id,
    );
    expect(reachedThreshold1).toBe(false);
    const reachedThreshold2 = await referralService.reachedReferralThreshold(
      user2.id,
    );
    expect(reachedThreshold2).toBe(false);
    const reachedThreshold3 = await referralService.reachedReferralThreshold(
      user3.id,
    );
    expect(reachedThreshold3).toBe(false);

    // delete user referrals
    const referrals1 = await referralService.getReferrals(user1.id);
    expect(referrals1).toBeDefined();
    expect(referrals1.length).toBe(2);
    await referralService.deleteUserReferrals(user1.id);
    const referrals2 = await referralService.getReferrals(user1.id);
    expect(referrals2).toBeDefined();
    expect(referrals2.length).toBe(0);
    const referrals3 = await referralService.getReferrals(user2.id);
    expect(referrals3).toBeDefined();
    expect(referrals3.length).toBe(0);
    const referrals4 = await referralService.getReferrals(user3.id);
    expect(referrals4).toBeDefined();
    expect(referrals4.length).toBe(0);
  });
});
