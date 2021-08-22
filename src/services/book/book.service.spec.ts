import { BookService } from './book.service';
import { UserService } from '../user/user.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';

describe('BookService', () => {
  let bookService: BookService;
  let userService: UserService;
  let user: NBUser;

  const firstname = 'Martin';
  const lastname = 'Luther';
  const email = 'luthma01@luther.edu';
  const password = 'password123';

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

  beforeAll(async () => {
    bookService = await getService(BookService);
    userService = await getService(UserService);
  });

  beforeEach(async () => {
    user = await userService.createUser(firstname, lastname, email, password);
  });

  afterEach(async () => {
    await userService.deleteUser(user.id);
  });

  it('should be defined', () => {
    expect(bookService).toBeDefined();
  });

  it('should create and delete books', async () => {
    // create
    const book1 = await bookService.createBook({
      userID: user.id,
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
    expect(book1).toHaveProperty('id');
    expect(book1).toHaveProperty('userID', user.id);
    expect(book1).toHaveProperty('title', title);
    expect(book1).toHaveProperty('author', author);
    expect(book1).toHaveProperty('description', description);
    expect(book1).toHaveProperty('ISBN10', ISBN10.replace(/-/g, ''));
    expect(book1).toHaveProperty('ISBN13', ISBN13.replace(/-/g, ''));
    expect(book1).toHaveProperty('imageID');
    expect(book1).toHaveProperty('departmentID', departmentID);
    expect(book1).toHaveProperty('courseNumber', courseNumber);
    expect(book1).toHaveProperty('price', price);
    expect(book1).toHaveProperty('conditionID', conditionID);
    expect(book1).toHaveProperty('listTime');
    expect(book1).toHaveProperty('editTime', null);

    // create minimal
    const book2 = await bookService.createBook({
      userID: user.id,
      title,
      author,
      description,
      imageData,
      departmentID,
      price,
      conditionID,
    });
    expect(book2).toBeDefined();
    expect(book2).toHaveProperty('id');
    expect(book2).toHaveProperty('userID', user.id);
    expect(book2).toHaveProperty('title', title);
    expect(book2).toHaveProperty('author', author);
    expect(book2).toHaveProperty('description', description);
    expect(book2).toHaveProperty('ISBN10', null);
    expect(book2).toHaveProperty('ISBN13', null);
    expect(book2).toHaveProperty('imageID');
    expect(book2).toHaveProperty('departmentID', departmentID);
    expect(book2).toHaveProperty('courseNumber', null);
    expect(book2).toHaveProperty('price', price);
    expect(book2).toHaveProperty('conditionID', conditionID);
    expect(book2).toHaveProperty('listTime');
    expect(book2).toHaveProperty('editTime', null);

    // check current books
    const currentBooks1 = await userService.getCurrentBooks(user.id);
    expect(currentBooks1).toBeDefined();
    expect(currentBooks1).toEqual([book1, book2]);
    const user1 = await userService.getUser(user.id);
    expect(user1).toBeDefined();
    expect(user1.numBooksListed).toBe(2);
    expect(user1.numBooksSold).toBe(0);
    expect(user1.moneyMade).toBe(0);

    // delete
    await bookService.deleteBook(book1.id, true);
    await bookService.deleteBook(book2.id, false);
    const currentBooks2 = await userService.getCurrentBooks(user.id);
    expect(currentBooks2).toBeDefined();
    expect(currentBooks2).toEqual([]);
    const user2 = await userService.getUser(user.id);
    expect(user2).toBeDefined();
    expect(user2.numBooksListed).toBe(2);
    expect(user2.numBooksSold).toBe(1);
    expect(user2.moneyMade).toBe(price);
  });

  it('should create, edit, and delete books', async () => {
    // create
    const book1 = await bookService.createBook({
      userID: user.id,
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
    expect(book1).toHaveProperty('id');
    expect(book1).toHaveProperty('userID', user.id);
    expect(book1).toHaveProperty('title', title);
    expect(book1).toHaveProperty('author', author);
    expect(book1).toHaveProperty('description', description);
    expect(book1).toHaveProperty('ISBN10', ISBN10.replace(/-/g, ''));
    expect(book1).toHaveProperty('ISBN13', ISBN13.replace(/-/g, ''));
    expect(book1).toHaveProperty('imageID');
    expect(book1).toHaveProperty('departmentID', departmentID);
    expect(book1).toHaveProperty('courseNumber', courseNumber);
    expect(book1).toHaveProperty('price', price);
    expect(book1).toHaveProperty('conditionID', conditionID);
    expect(book1).toHaveProperty('listTime');
    expect(book1).toHaveProperty('editTime', null);

    // edit
    const newPrice = 52.99;
    const newConditionID = 2;
    const newImageData = 'xyz';
    const book2 = await bookService.editBook(book1.id, {
      price: newPrice,
      conditionID: newConditionID,
      imageData: newImageData,
    });
    expect(book2).toBeDefined();
    expect(book2).toHaveProperty('id', book1.id);
    expect(book2).toHaveProperty('userID', user.id);
    expect(book2).toHaveProperty('title', title);
    expect(book2).toHaveProperty('author', author);
    expect(book2).toHaveProperty('description', description);
    expect(book2).toHaveProperty('ISBN10', ISBN10.replace(/-/g, ''));
    expect(book2).toHaveProperty('ISBN13', ISBN13.replace(/-/g, ''));
    expect(book2).toHaveProperty('imageID', book1.imageID);
    expect(book2).toHaveProperty('departmentID', departmentID);
    expect(book2).toHaveProperty('courseNumber', courseNumber);
    expect(book2).toHaveProperty('price', newPrice);
    expect(book2).toHaveProperty('conditionID', newConditionID);
    expect(book2).toHaveProperty('listTime', book1.listTime);
    expect(book2).toHaveProperty('editTime');
    expect(book2.editTime).not.toBeNull();

    // delete
    await bookService.deleteBook(book1.id, false);
  });

  it('should create, check existence, get, get user, and delete books', async () => {
    // create
    const book1 = await bookService.createBook({
      userID: user.id,
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
    expect(book1).toHaveProperty('id');
    expect(book1).toHaveProperty('userID', user.id);
    expect(book1).toHaveProperty('title', title);
    expect(book1).toHaveProperty('author', author);
    expect(book1).toHaveProperty('description', description);
    expect(book1).toHaveProperty('ISBN10', ISBN10.replace(/-/g, ''));
    expect(book1).toHaveProperty('ISBN13', ISBN13.replace(/-/g, ''));
    expect(book1).toHaveProperty('imageID');
    expect(book1).toHaveProperty('departmentID', departmentID);
    expect(book1).toHaveProperty('courseNumber', courseNumber);
    expect(book1).toHaveProperty('price', price);
    expect(book1).toHaveProperty('conditionID', conditionID);
    expect(book1).toHaveProperty('listTime');
    expect(book1).toHaveProperty('editTime', null);

    // check existence
    const bookExists1 = await bookService.bookExists(book1.id);
    expect(bookExists1).toBeTruthy();

    // get
    const book2 = await bookService.getBook(book1.id);
    expect(book2).toBeDefined();
    expect(book2).toEqual(book1);

    // get user
    const bookUser = await bookService.getBookUser(book1.id);
    expect(bookUser).toBeDefined();
    expect(bookUser).not.toEqual(user);
    expect(bookUser.id).toBe(user.id);
    expect(bookUser.numBooksListed).toBe(user.numBooksListed + 1);

    // delete
    await bookService.deleteBook(book1.id, false);
    const bookExists2 = await bookService.bookExists(book1.id);
    expect(bookExists2).toBeFalsy();
    await expect(bookService.getBook(book1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should search books', async () => {
    // TODO: search books
  });
});
