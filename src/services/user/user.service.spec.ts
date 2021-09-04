/**
 * User service tests.
 * @packageDocumentation
 */

import { UserService } from './user.service';
import { ImageService } from '../image/image.service';
import { BookService } from '../book/book.service';
import { UserInterestService } from '../user-interest/user-interest.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('UserService', () => {
  let userService: UserService;
  let imageService: ImageService;
  let bookService: BookService;
  let userInterestService: UserInterestService;

  beforeAll(async () => {
    userService = await getService(UserService);
    imageService = await getService(ImageService);
    bookService = await getService(BookService);
    userInterestService = await getService(UserInterestService);
  });

  it('should create, check existence, get, get books, and delete a user', async () => {
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

    // create invalid
    await expect(
      userService.createUser('', lastname, email, password),
    ).rejects.toThrow(ServiceException);
    await expect(
      userService.createUser(firstname, '', email, password),
    ).rejects.toThrow(ServiceException);
    await expect(
      userService.createUser(firstname, lastname, 'fake', password),
    ).rejects.toThrow(ServiceException);
    await expect(
      userService.createUser(firstname, lastname, email, 'bad_pw'),
    ).rejects.toThrow(ServiceException);
    await expect(
      userService.createUser(firstname, lastname, email, password),
    ).rejects.toThrow(ServiceException);

    // check existence
    const userExists1 = await userService.userExists(user1.id);
    expect(userExists1).toBe(true);

    // check existence by email
    const userExists2 = await userService.userExistsByEmail(email);
    expect(userExists2).toBe(true);

    // get
    const user2 = await userService.getUser(user1.id);
    expect(user2).toBeDefined();
    expect(user2).toEqual(user1);

    // get by email
    const user3 = await userService.getUserByEmail(email);
    expect(user3).toBeDefined();
    expect(user3).toEqual(user1);
    await expect(userService.getUserByEmail('')).rejects.toThrow(
      ServiceException,
    );

    // get books
    const books = await userService.getCurrentBooks(user1.id);
    expect(books).toBeDefined();
    expect(books.length).toBe(0);
    await expect(userService.getCurrentBooks('')).rejects.toThrow(
      ServiceException,
    );

    // delete
    await userService.deleteUser(user1.id);
    const userExists3 = await userService.userExists(user1.id);
    expect(userExists3).toBe(false);
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
    await expect(userService.setPassword('', newPassword)).rejects.toThrow(
      ServiceException,
    );
    await expect(userService.setPassword(user1.id, 'bad_pw')).rejects.toThrow(
      ServiceException,
    );

    // set verified
    const user4 = await userService.setVerified(user1.id);
    expect(user4).toBeDefined();
    expect(user4.id).toBe(user1.id);
    expect(user4.verified).toBe(true);
    const user5 = await userService.getUser(user1.id);
    expect(user5).toBeDefined();
    expect(user5).toEqual(user4);
    await expect(userService.setVerified('')).rejects.toThrow(ServiceException);

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
    const userImage = await imageService.getImage(user6.imageID);
    expect(userImage).toBeDefined();
    const newImageData = 'def';
    const user8 = await userService.setUserImage(user1.id, newImageData);
    expect(user8).toBeDefined();
    expect(user8).toEqual(user6);

    // delete image
    const user9 = await userService.deleteUserImage(user1.id);
    expect(user9).toBeDefined();
    expect(user9.id).toBe(user1.id);
    expect(user9.imageID).toBeNull();
    const user10 = await userService.getUser(user1.id);
    expect(user10).toBeDefined();
    expect(user10).toEqual(user9);

    // delete
    await userService.deleteUser(user1.id);
    const userExists = await userService.userExists(user1.id);
    expect(userExists).toBe(false);
    await expect(userService.getUser(user1.id)).rejects.toThrow(
      ServiceException,
    );
    await expect(imageService.getImage(user1.imageID)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should create, increment books listed/sold, add money made, and delete a user', async () => {
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

    // increment books listed
    const user2 = await userService.incrementBooksListed(user1.id);
    expect(user2).toBeDefined();
    expect(user2).not.toEqual(user1);
    expect(user2.numBooksListed).toBe(1);
    const user3 = await userService.incrementBooksListed(user1.id, 3);
    expect(user3).toBeDefined();
    expect(user3).not.toEqual(user2);
    expect(user3.numBooksListed).toBe(4);

    // increment books sold
    const user4 = await userService.incrementBooksSold(user1.id);
    expect(user4).toBeDefined();
    expect(user4).not.toEqual(user3);
    expect(user4.numBooksSold).toBe(1);
    const user5 = await userService.incrementBooksSold(user1.id, 5);
    expect(user5).toBeDefined();
    expect(user5).not.toEqual(user4);
    expect(user5.numBooksSold).toBe(6);

    // add money made
    const user6 = await userService.addMoneyMade(user1.id, 3.14);
    expect(user6).toBeDefined();
    expect(user6).not.toEqual(user5);
    expect(user6.moneyMade).toBe(3.14);
    const user7 = await userService.addMoneyMade(user1.id, 2.718);
    expect(user7).toBeDefined();
    expect(user7).not.toEqual(user6);
    expect(user7.moneyMade).toBe(5.86);

    // delete
    await userService.deleteUser(user1.id);
    const userExists = await userService.userExists(user1.id);
    expect(userExists).toBe(false);
    await expect(userService.getUser(user1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should create, get book recommendations, and delete a user', async () => {
    // create
    const firstname = 'Martin';
    const lastname = 'Luther';
    const email1 = 'luthma01@luther.edu';
    const email2 = 'luthma02@luther.edu';
    const email3 = 'luthma03@luther.edu';
    const password = 'password123';
    const user1 = await userService.createUser(
      firstname,
      lastname,
      email1,
      password,
    );
    expect(user1).toBeDefined();
    const user2 = await userService.createUser(
      firstname,
      lastname,
      email2,
      password,
    );
    expect(user2).toBeDefined();
    const user3 = await userService.createUser(
      firstname,
      lastname,
      email3,
      password,
    );
    expect(user3).toBeDefined();
    const title = 'The C Programming Language';
    const author = 'Dennis Ritchie';
    const description =
      'The C Programming Language is a computer programming book written by Brian Kernighan and Dennis Ritchie, the latter of whom originally designed and implemented the language, as well as co-designed the Unix operating system with which development of the language was closely intertwined.';
    const ISBN10 = '0131103628';
    const ISBN13 = '978-0131103627';
    const imageData = 'abc';
    const departmentID = 15;
    const courseNumber = 253;
    const price = 48.99;
    const conditionID = 1;
    const book1 = await bookService.createBook({
      userID: user1.id,
      title,
      author,
      description,
      ISBN10,
      ISBN13,
      imageData,
      departmentID,
      courseNumber,
      price,
      conditionID,
    });
    expect(book1).toBeDefined();

    // get book recommendations
    const recommendations1 = await userService.recommendations(user1.id);
    expect(recommendations1).toBeDefined();
    expect(recommendations1).toEqual([]);
    const recommendations2 = await userService.recommendations(user2.id);
    expect(recommendations2).toBeDefined();
    expect(recommendations2).toEqual([]);
    const userInterest1 = await userInterestService.noteInterest(
      user2.id,
      departmentID,
    );
    expect(userInterest1).toBeDefined();
    const recommendations3 = await userService.recommendations(user1.id);
    expect(recommendations3).toBeDefined();
    expect(recommendations3).toEqual([]);
    const recommendations4 = await userService.recommendations(user2.id);
    expect(recommendations4).toBeDefined();
    expect(recommendations4).toEqual([book1]);
    await userInterestService.dropInterest(user2.id, departmentID);
    const book2 = await bookService.createBook({
      userID: user2.id,
      title,
      author,
      description,
      ISBN10,
      ISBN13,
      imageData,
      departmentID,
      courseNumber,
      price,
      conditionID,
    });
    expect(book2).toBeDefined();
    const recommendations5 = await userService.recommendations(user1.id);
    expect(recommendations5).toBeDefined();
    expect(recommendations5).toEqual([book2]);
    const recommendations6 = await userService.recommendations(user2.id);
    expect(recommendations6).toBeDefined();
    expect(recommendations6).toEqual([book1]);
    const recommendations7 = await userService.recommendations(user3.id);
    expect(recommendations7).toBeDefined();
    expect(recommendations7).toEqual([]);
    const userInterest2 = await userInterestService.noteInterest(
      user3.id,
      departmentID,
    );
    expect(userInterest2).toBeDefined();
    const recommendations8 = await userService.recommendations(user3.id);
    expect(recommendations8).toBeDefined();
    expect(recommendations8).toEqual([book1, book2]);
    await userInterestService.dropInterest(user3.id, departmentID);

    // delete
    await userInterestService.dropInterest(user2.id, departmentID);
    await bookService.deleteBook(book1.id, false);
    await bookService.deleteBook(book2.id, false);
    await userService.deleteUser(user1.id);
    await userService.deleteUser(user2.id);
    await userService.deleteUser(user3.id);
  });

  it('should create, login, prune, and delete a user', async () => {
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

    // login unverified
    await expect(userService.login(email, password)).rejects.toThrow(
      ServiceException,
    );
    await userService.setVerified(user1.id);

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
    await expect(userService.login('wrong-email', password)).rejects.toThrow(
      ServiceException,
    );

    // prune
    await userService.pruneUnverifiedUsers();
    const user3 = await userService.getUser(user1.id);
    expect(user3).toBeDefined();

    // delete
    await userService.deleteUser(user1.id);
    const userExists = await userService.userExists(user1.id);
    expect(userExists).toBe(false);
    await expect(userService.getUser(user1.id)).rejects.toThrow(
      ServiceException,
    );
  });
});
