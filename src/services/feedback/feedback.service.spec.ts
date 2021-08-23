import { FeedbackService } from './feedback.service';
import { UserService } from '../user/user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';

describe('FeedbackService', () => {
  let feedbackService: FeedbackService;
  let userService: UserService;
  let user: NBUser;

  const firstname = 'Martin';
  const lastname = 'Luther';
  const email = 'luthma01@luther.edu';
  const password = 'password123';

  const userFeedback = 'Testing feedback';

  beforeAll(async () => {
    feedbackService = await getService(FeedbackService);
    userService = await getService(UserService);
  });

  beforeEach(async () => {
    user = await userService.createUser(firstname, lastname, email, password);
  });

  afterEach(async () => {
    await userService.deleteUser(user.id);
  });

  it('should be defined', () => {
    expect(feedbackService).toBeDefined();
  });

  it('should send and delete feedback', async () => {
    // send invalid feedback
    await expect(feedbackService.sendFeedback(user.id, '')).rejects.toThrow(
      ServiceException,
    );

    // send
    const feedback = await feedbackService.sendFeedback(user.id, userFeedback);
    expect(feedback).toBeDefined();
    expect(feedback).toHaveProperty('id');
    expect(feedback).toHaveProperty('userID', user.id);
    expect(feedback).toHaveProperty('feedback', userFeedback);
    expect(feedback).toHaveProperty('submitTime');

    // send additional feedback
    await expect(
      feedbackService.sendFeedback(user.id, userFeedback),
    ).rejects.toThrow(ServiceException);

    // delete
    await feedbackService.deleteFeedback(feedback.id);
  });

  it('should send, check existence, get, and delete feedback', async () => {
    // send
    const feedback1 = await feedbackService.sendFeedback(user.id, userFeedback);
    expect(feedback1).toBeDefined();
    expect(feedback1).toHaveProperty('id');
    expect(feedback1).toHaveProperty('userID', user.id);
    expect(feedback1).toHaveProperty('feedback', userFeedback);
    expect(feedback1).toHaveProperty('submitTime');

    // check existence
    const feedbackExists1 = await feedbackService.feedbackExists(feedback1.id);
    expect(feedbackExists1).toBe(true);

    // get
    const feedback2 = await feedbackService.getFeedback(feedback1.id);
    expect(feedback2).toBeDefined();
    expect(feedback2).toEqual(feedback1);

    // delete
    await feedbackService.deleteFeedback(feedback1.id);
    const feedbackExists2 = await feedbackService.feedbackExists(feedback1.id);
    expect(feedbackExists2).toBe(false);
    await expect(feedbackService.getFeedback(feedback1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should send, get user feedback, and delete feedback', async () => {
    // get user feedback
    const feedback1 = await feedbackService.getUserFeedback(user.id);
    expect(feedback1).not.toBeDefined();

    // send
    const feedback2 = await feedbackService.sendFeedback(user.id, userFeedback);
    expect(feedback2).toBeDefined();
    expect(feedback2).toHaveProperty('id');
    expect(feedback2).toHaveProperty('userID', user.id);
    expect(feedback2).toHaveProperty('feedback', userFeedback);
    expect(feedback2).toHaveProperty('submitTime');

    // get user feedback
    const feedback3 = await feedbackService.getUserFeedback(user.id);
    expect(feedback3).toBeDefined();
    expect(feedback3).toEqual(feedback2);

    // delete
    await feedbackService.deleteFeedback(feedback2.id);
  });
});
