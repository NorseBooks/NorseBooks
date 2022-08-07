/**
 * Admin service tests.
 * @packageDocumentation
 */

import { AdminService } from './admin.service';
import { getService } from '../test-util';

describe('AdminService', () => {
  let adminService: AdminService;

  beforeAll(async () => {
    adminService = await getService(AdminService);
  });

  it('should get stats and database usage', async () => {
    // get stats
    const stats = await adminService.getStats();
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('users', 0);
    expect(stats).toHaveProperty('books', 0);
    expect(stats).toHaveProperty('booksListed', 0);
    expect(stats).toHaveProperty('booksSold', 0);
    expect(stats).toHaveProperty('moneyMade', 0.0);
    expect(stats).toHaveProperty('tables');
    expect(stats).toHaveProperty('rows');
    expect(stats).toHaveProperty('capacity');
    expect(stats).toHaveProperty('reports', 0);
    expect(stats).toHaveProperty('feedback', 0);

    // get database usage
    const dbUsage = await adminService.getDatabaseUsage();
    expect(dbUsage).toBeDefined();
    expect(Object.keys(dbUsage).length).toBe(stats.tables);
    expect(dbUsage.NB_USER).toBe(0);
    expect(dbUsage.NB_BOOK).toBe(0);
    expect(dbUsage.NB_RESOURCE).toBeGreaterThan(0);
  });

  it('should get all users and all books', async () => {
    // get all users
    const users = await adminService.getUsers();
    expect(users).toBeDefined();
    expect(users.length).toBe(0);
    expect(users).toEqual([]);

    // get all books
    const books = await adminService.getBooks();
    expect(books).toBeDefined();
    expect(books.length).toBe(0);
    expect(books).toEqual([]);
  });
});
