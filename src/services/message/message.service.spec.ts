import { MessageService } from './message.service';
import { UserService } from '../user/user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';

describe('MessageService', () => {
  let messageService: MessageService;
  let userService: UserService;
  let user1: NBUser;
  let user2: NBUser;

  const firstname = 'Martin';
  const lastname = 'Luther';
  const email1 = 'luthma01@luther.edu';
  const email2 = 'luthma02@luther.edu';
  const password = 'password123';

  const content1 = 'Hello, world!';
  const content2 = 'Hello, NorseBooks!';

  beforeAll(async () => {
    messageService = await getService(MessageService);
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

  it('should send, check existence, get, and delete messages', async () => {
    // send
    const message1 = await messageService.sendMessage(
      user1.id,
      user2.id,
      content1,
    );
    expect(message1).toBeDefined();
    expect(message1).toHaveProperty('id');
    expect(message1).toHaveProperty('fromUserID', user1.id);
    expect(message1).toHaveProperty('toUserID', user2.id);
    expect(message1).toHaveProperty('content', content1);
    expect(message1).toHaveProperty('read', false);
    expect(message1).toHaveProperty('sendTime');
    await expect(
      messageService.sendMessage('', user2.id, content1),
    ).rejects.toThrow(ServiceException);
    await expect(
      messageService.sendMessage(user1.id, '', content1),
    ).rejects.toThrow(ServiceException);
    await expect(
      messageService.sendMessage(user1.id, user2.id, ''),
    ).rejects.toThrow(ServiceException);

    // check existence
    const messageExists1 = await messageService.messageExists(message1.id);
    expect(messageExists1).toBe(true);

    // get
    const message2 = await messageService.getMessage(message1.id);
    expect(message2).toBeDefined();
    expect(message2).toEqual(message1);

    // delete
    await messageService.deleteMessage(message1.id);
    const messageExists2 = await messageService.messageExists(message1.id);
    expect(messageExists2).toBe(false);
    await expect(messageService.getMessage(message1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should send, get threads, get messages, and delete messages', async () => {
    // send
    const message1 = await messageService.sendMessage(
      user1.id,
      user2.id,
      content1,
    );
    expect(message1).toBeDefined();
    expect(message1).toHaveProperty('id');
    expect(message1).toHaveProperty('fromUserID', user1.id);
    expect(message1).toHaveProperty('toUserID', user2.id);
    expect(message1).toHaveProperty('content', content1);
    expect(message1).toHaveProperty('read', false);
    expect(message1).toHaveProperty('sendTime');
    const message2 = await messageService.sendMessage(
      user2.id,
      user1.id,
      content2,
    );
    expect(message2).toBeDefined();
    expect(message2).toHaveProperty('id');
    expect(message2).toHaveProperty('fromUserID', user2.id);
    expect(message2).toHaveProperty('toUserID', user1.id);
    expect(message2).toHaveProperty('content', content2);
    expect(message2).toHaveProperty('read', false);
    expect(message2).toHaveProperty('sendTime');

    // get threads
    const threads1 = await messageService.getMessageThreads(user1.id);
    expect(threads1).toBeDefined();
    expect(threads1.length).toBe(1);
    expect(threads1[0]).toEqual(message2);
    const threads2 = await messageService.getMessageThreads(user2.id);
    expect(threads2).toBeDefined();
    expect(threads2.length).toBe(1);
    expect(threads2[0]).toEqual(message2);
    await expect(messageService.getMessageThreads('')).rejects.toThrow(
      ServiceException,
    );

    // get messages
    const messages1 = await messageService.getMessages(user1.id, user2.id);
    expect(messages1).toBeDefined();
    expect(messages1.length).toBe(2);
    expect(messages1).toEqual([message1, message2]);
    await expect(messageService.getMessages('', user2.id)).rejects.toThrow(
      ServiceException,
    );
    await expect(messageService.getMessages(user1.id, '')).rejects.toThrow(
      ServiceException,
    );

    // delete
    await messageService.deleteMessage(message1.id);
    const threads3 = await messageService.getMessageThreads(user1.id);
    expect(threads3).toBeDefined();
    expect(threads3.length).toBe(1);
    expect(threads3[0]).toEqual(message2);
    const threads4 = await messageService.getMessageThreads(user2.id);
    expect(threads4).toBeDefined();
    expect(threads4.length).toBe(1);
    expect(threads4[0]).toEqual(message2);
    const messages2 = await messageService.getMessages(user1.id, user2.id);
    expect(messages2).toBeDefined();
    expect(messages2.length).toBe(1);
    expect(messages2[0]).toEqual(message2);
    await messageService.deleteMessage(message2.id);
    const threads5 = await messageService.getMessageThreads(user1.id);
    expect(threads5).toBeDefined();
    expect(threads5.length).toBe(0);
    const threads6 = await messageService.getMessageThreads(user2.id);
    expect(threads6).toBeDefined();
    expect(threads6.length).toBe(0);
    const messages3 = await messageService.getMessages(user1.id, user2.id);
    expect(messages3).toBeDefined();
    expect(messages3.length).toBe(0);
  });

  it('should send, mark read, mark unread, delete, and delete old messages', async () => {
    // send
    const message1 = await messageService.sendMessage(
      user1.id,
      user2.id,
      content1,
    );
    expect(message1).toBeDefined();
    expect(message1).toHaveProperty('id');
    expect(message1).toHaveProperty('fromUserID', user1.id);
    expect(message1).toHaveProperty('toUserID', user2.id);
    expect(message1).toHaveProperty('content', content1);
    expect(message1).toHaveProperty('read', false);
    expect(message1).toHaveProperty('sendTime');

    // mark read
    const message2 = await messageService.markRead(message1.id);
    expect(message2).toBeDefined();
    expect(message2).not.toEqual(message1);
    expect(message2.id).toEqual(message1.id);
    expect(message2.read).toBe(true);
    const message3 = await messageService.getMessage(message1.id);
    expect(message3).toBeDefined();
    expect(message3).toEqual(message2);
    await expect(messageService.markRead('')).rejects.toThrow(ServiceException);

    // mark unread
    const message4 = await messageService.markUnread(message1.id);
    expect(message4).toBeDefined();
    expect(message4).not.toEqual(message2);
    expect(message4).toEqual(message1);
    expect(message4.read).toBe(false);
    await expect(messageService.markUnread('')).rejects.toThrow(
      ServiceException,
    );

    // delete
    await messageService.deleteMessage(message1.id);

    // delete old
    await messageService.deleteOldMessages(user1.id, user2.id);
    await expect(
      messageService.deleteOldMessages('', user2.id),
    ).rejects.toThrow(ServiceException);
    await expect(
      messageService.deleteOldMessages(user1.id, ''),
    ).rejects.toThrow(ServiceException);
  });
});
