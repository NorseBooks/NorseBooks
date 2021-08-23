import { BookConditionService } from './book-condition.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('BookConditionService', () => {
  let bookConditionService: BookConditionService;

  beforeAll(async () => {
    bookConditionService = await getService(BookConditionService);
  });

  it('should be defined', () => {
    expect(bookConditionService).toBeDefined();
  });

  it('should check if book conditions exist', async () => {
    // exists
    const exists1 = await bookConditionService.bookConditionExists(3);
    expect(exists1).toBe(true);
    const exists2 = await bookConditionService.bookConditionExists(-1);
    expect(exists2).toBe(false);
  });

  it('should check if book conditions exist by name', async () => {
    // exists by name
    const exists1 = await bookConditionService.bookConditionExistsByName(
      'Poor',
    );
    expect(exists1).toBe(true);
    const exists2 = await bookConditionService.bookConditionExistsByName(
      'Perfect',
    );
    expect(exists2).toBe(false);
  });

  it("should get a book condition's name", async () => {
    // get book condition name
    const bookCondition = await bookConditionService.getBookConditionName(2);
    expect(bookCondition).toBe('Fair');
    await expect(bookConditionService.getBookConditionName(-1)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should get all book conditions', async () => {
    // get all book conditions
    const bookConditions = await bookConditionService.getBookConditions();
    expect(bookConditions).toBeDefined();
    expect(bookConditions.length).toBeGreaterThan(0);
    expect(bookConditions[0]).toEqual({ id: 0, name: 'New' });
  });
});
