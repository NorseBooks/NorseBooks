import { ReportService } from './report.service';
import { UserService } from '../user/user.service';
import { BookService } from '../book/book.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';
import { NBUser } from '../user/user.interface';
import { NBBook } from '../book/book.interface';

describe('ReportService', () => {
  let reportService: ReportService;
  let bookService: BookService;
  let userService: UserService;
  let user: NBUser;
  let book: NBBook;

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

  const reason = 'Test report';

  beforeAll(async () => {
    reportService = await getService(ReportService);
    bookService = await getService(BookService);
    userService = await getService(UserService);
  });

  beforeEach(async () => {
    user = await userService.createUser(firstname, lastname, email, password);
    book = await bookService.createBook({
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
  });

  afterEach(async () => {
    const bookExists = await bookService.bookExists(book.id);

    if (bookExists) {
      await bookService.deleteBook(book.id, false);
    }

    await userService.deleteUser(user.id);
  });

  it('should create, check existence, get, and delete a report', async () => {
    // create with error
    await expect(
      reportService.reportBook(user.id, book.id, ''),
    ).rejects.toThrow(ServiceException);

    // create
    const report1 = await reportService.reportBook(user.id, book.id, reason);
    expect(report1).toBeDefined();
    expect(report1).toHaveProperty('id');
    expect(report1).toHaveProperty('bookID', book.id);
    expect(report1).toHaveProperty('userID', user.id);
    expect(report1).toHaveProperty('reason', reason);
    expect(report1).toHaveProperty('reportTime');

    // check existence
    const reportExists1 = await reportService.reportExists(report1.id);
    expect(reportExists1).toBe(true);

    // get
    const report2 = await reportService.getReport(report1.id);
    expect(report2).toBeDefined();
    expect(report2).toEqual(report1);

    // delete
    await reportService.deleteReport(report1.id);
    const reportExists2 = await reportService.reportExists(report1.id);
    expect(reportExists2).toBe(false);
    await expect(reportService.getReport(report1.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should create, get all reports, get book reports, and delete reported book', async () => {
    // get all reports
    const reports1 = await reportService.getReports();
    expect(reports1).toBeDefined();
    expect(reports1.length).toBe(0);

    // get book reports
    const bookReports1 = await reportService.getBookReports(book.id);
    expect(bookReports1).toBeDefined();
    expect(bookReports1.length).toBe(0);

    // create
    const report = await reportService.reportBook(user.id, book.id, reason);
    expect(report).toBeDefined();
    expect(report).toHaveProperty('id');
    expect(report).toHaveProperty('bookID', book.id);
    expect(report).toHaveProperty('userID', user.id);
    expect(report).toHaveProperty('reason', reason);
    expect(report).toHaveProperty('reportTime');

    // get all reports
    const reports2 = await reportService.getReports();
    expect(reports2).toBeDefined();
    expect(reports2.length).toBe(1);
    expect(reports2[0]).toEqual(report);

    // get book reports
    const bookReports2 = await reportService.getBookReports(book.id);
    expect(bookReports2).toBeDefined();
    expect(bookReports2.length).toBe(1);
    expect(bookReports2[0]).toEqual(report);

    // delete reported book
    await reportService.deleteReportedBook(report.id);
    const reports3 = await reportService.getReports();
    expect(reports3).toBeDefined();
    expect(reports3.length).toBe(0);
    await expect(reportService.getBookReports(book.id)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should create, check if user reported a book, check if user reported recently, get user reported books, and delete reports', async () => {
    // check if user reported a book
    const reportedBook1 = await reportService.userReportedBook(
      user.id,
      book.id,
    );
    expect(reportedBook1).toBe(false);

    // check if user reported recently
    const reportedRecently1 = await reportService.userReportedRecently(user.id);
    expect(reportedRecently1).toBe(false);

    // get user reported books
    const reportedBooks1 = await reportService.getUserBookReports(user.id);
    expect(reportedBooks1).toBeDefined();
    expect(reportedBooks1.length).toBe(0);

    // create
    const report = await reportService.reportBook(user.id, book.id, reason);
    expect(report).toBeDefined();
    expect(report).toHaveProperty('id');
    expect(report).toHaveProperty('bookID', book.id);
    expect(report).toHaveProperty('userID', user.id);
    expect(report).toHaveProperty('reason', reason);
    expect(report).toHaveProperty('reportTime');

    // check if user reported a book
    const reportedBook2 = await reportService.userReportedBook(
      user.id,
      book.id,
    );
    expect(reportedBook2).toBe(true);

    // check if user reported recently
    const reportedRecently2 = await reportService.userReportedRecently(user.id);
    expect(reportedRecently2).toBe(true);

    // get user reported books
    const reportedBooks2 = await reportService.getUserBookReports(user.id);
    expect(reportedBooks2).toBeDefined();
    expect(reportedBooks2.length).toBe(1);
    expect(reportedBooks2[0]).toEqual(report);

    // delete
    await reportService.deleteReport(report.id);
    const reportedBook3 = await reportService.userReportedBook(
      user.id,
      book.id,
    );
    expect(reportedBook3).toBe(false);
    const reportedRecently3 = await reportService.userReportedRecently(user.id);
    expect(reportedRecently3).toBe(false);
    const reportedBooks3 = await reportService.getUserBookReports(user.id);
    expect(reportedBooks3).toBeDefined();
    expect(reportedBooks3.length).toBe(0);
  });
});
