import { ServiceException } from '../service.exception';
import { getService } from '../test-util';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';

describe('SessionService', () => {
  let sessionService: SessionService;
  let userService: UserService;

  beforeAll(async () => {
    sessionService = await getService(SessionService);
    userService = await getService(UserService);
  });

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });

  it('should create, check existence, get, and delete a session', async () => {
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
    const session1 = await sessionService.createSession(user.id);
    expect(session1).toBeDefined();
    expect(session1).toHaveProperty('id');
    expect(session1).toHaveProperty('userID', user.id);
    expect(session1).toHaveProperty('createTime');

    // check existence
    const sessionExists1 = await sessionService.sessionExists(session1.id);
    expect(sessionExists1).toBeTruthy();

    // get
    const session2 = await sessionService.getSession(session1.id);
    expect(session2).toBeDefined();
    expect(session2).toEqual(session1);

    // delete
    await sessionService.deleteSession(session1.id);
    const sessionExists2 = await sessionService.sessionExists(session1.id);
    expect(sessionExists2).toBeFalsy();
    await userService.deleteUser(user.id);
    await expect(sessionService.createSession(user.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it("should create, get user by session, and get/delete a user's sessions", async () => {
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
    const session1 = await sessionService.createSession(user1.id);
    expect(session1).toBeDefined();
    expect(session1).toHaveProperty('id');
    expect(session1).toHaveProperty('userID', user1.id);
    expect(session1).toHaveProperty('createTime');

    // get user by session
    const user2 = await sessionService.getUserBySessionID(session1.id);
    expect(user2).toBeDefined();
    expect(user2).toEqual(user1);

    // get user sessions
    const sessions1 = await sessionService.getUserSessions(user1.id);
    expect(sessions1).toBeDefined();
    expect(sessions1.length).toBe(1);
    const session2 = sessions1[0];
    expect(session2).toEqual(session1);

    // delete user sessions
    await sessionService.deleteUserSessions(user1.id);
    const sessions2 = await sessionService.getUserSessions(user1.id);
    expect(sessions2).toBeDefined();
    expect(sessions2.length).toBe(0);
    await userService.deleteUser(user1.id);
  });
});
