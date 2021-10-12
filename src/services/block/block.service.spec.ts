/**
 * User blocking service tests.
 * @packageDocumentation
 */

import { BlockService } from './block.service';
import { UserService } from '../user/user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';

describe('BlockService', () => {
  let blockService: BlockService;
  let userService: UserService;
  let user1: NBUser;
  let user2: NBUser;

  const firstname = 'Martin';
  const lastname = 'Luther';
  const email1 = 'luthma01@luther.edu';
  const email2 = 'luthma02@luther.edu';
  const password = 'password123';

  beforeAll(async () => {
    blockService = await getService(BlockService);
    userService = await getService(UserService);
  });

  beforeEach(async () => {
    user1 = await userService.createUser(firstname, lastname, email1, password);
    user2 = await userService.createUser(firstname, lastname, email2, password);
  });

  afterEach(async () => {
    await userService.deleteUser(user1.id);
    await userService.deleteUser(user2.id);
  });

  it('should block, check if blocked, and unblock users', async () => {
    // block
    const block1 = await blockService.blockUser(user1.id, user2.id);
    expect(block1).toBeDefined();
    expect(block1).toHaveProperty('userID', user1.id);
    expect(block1).toHaveProperty('blockedUserID', user2.id);
    expect(block1).toHaveProperty('blockTime');
    const block2 = await blockService.blockUser(user1.id, user2.id);
    expect(block2).toBeDefined();
    expect(block2).toEqual(block1);

    // create invalid
    await expect(blockService.blockUser('', user2.id)).rejects.toThrow(
      ServiceException,
    );
    await expect(blockService.blockUser(user1.id, '')).rejects.toThrow(
      ServiceException,
    );
    await expect(blockService.blockUser(user1.id, user1.id)).rejects.toThrow(
      ServiceException,
    );

    // check if blocked
    const blocked1 = await blockService.isBlocked(user1.id, user2.id);
    expect(blocked1).toBeDefined();
    expect(blocked1).toBe(true);

    // unblock
    await blockService.unblockUser(user1.id, user2.id);
    const blocked2 = await blockService.isBlocked(user1.id, user2.id);
    expect(blocked2).toBeDefined();
    expect(blocked2).toBe(false);
  });

  it('should block, get blocks, get blocked users, and unblock users', async () => {
    // block
    const block1 = await blockService.blockUser(user1.id, user2.id);
    expect(block1).toBeDefined();
    expect(block1).toHaveProperty('userID', user1.id);
    expect(block1).toHaveProperty('blockedUserID', user2.id);
    expect(block1).toHaveProperty('blockTime');

    // get blocks
    const blocks1 = await blockService.getBlocks(user1.id);
    expect(blocks1).toBeDefined();
    expect(blocks1.length).toBe(1);
    expect(blocks1).toEqual([block1]);
    const blocks2 = await blockService.getBlocks(user2.id);
    expect(blocks2).toBeDefined();
    expect(blocks2.length).toBe(0);
    expect(blocks2).toEqual([]);
    await expect(blockService.getBlocks('')).rejects.toThrow(ServiceException);

    // get blocked users
    const blockedUsers1 = await blockService.getBlockedUsers(user1.id);
    expect(blockedUsers1).toBeDefined();
    expect(blockedUsers1.length).toBe(1);
    expect(blockedUsers1).toEqual([user2]);
    const blockedUsers2 = await blockService.getBlockedUsers(user2.id);
    expect(blockedUsers2).toBeDefined();
    expect(blockedUsers2.length).toBe(0);
    expect(blockedUsers2).toEqual([]);
    await expect(blockService.getBlockedUsers('')).rejects.toThrow(
      ServiceException,
    );

    // unblock
    await blockService.unblockUser(user1.id, user2.id);
    const blocks3 = await blockService.getBlocks(user1.id);
    expect(blocks3).toBeDefined();
    expect(blocks3.length).toBe(0);
    expect(blocks3).toEqual([]);
    const blockedUsers3 = await blockService.getBlockedUsers(user1.id);
    expect(blockedUsers3).toBeDefined();
    expect(blockedUsers3.length).toBe(0);
    expect(blockedUsers3).toEqual([]);
  });
});
