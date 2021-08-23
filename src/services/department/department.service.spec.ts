import { DepartmentService } from './department.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('DepartmentService', () => {
  let departmentService: DepartmentService;

  beforeAll(async () => {
    departmentService = await getService(DepartmentService);
  });

  it('should check if departments exist', async () => {
    // exists
    const exists1 = await departmentService.departmentExists(17);
    expect(exists1).toBe(true);
    const exists2 = await departmentService.departmentExists(-1);
    expect(exists2).toBe(false);
  });

  it('should check if departments exist by name', async () => {
    // exists by name
    const exists1 = await departmentService.departmentExistsByName(
      'Computer Science',
    );
    expect(exists1).toBe(true);
    const exists2 = await departmentService.departmentExistsByName('Astrology');
    expect(exists2).toBe(false);
  });

  it("should get a department's name", async () => {
    // get department name
    const department = await departmentService.getDepartmentName(36);
    expect(department).toBe('Music');
    await expect(departmentService.getDepartmentName(-1)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should get all departments', async () => {
    // get all departments
    const departments = await departmentService.getDepartments();
    expect(departments).toBeDefined();
    expect(departments.length).toBeGreaterThan(0);
    expect(departments[0]).toEqual({ id: 0, name: 'Accounting' });
  });
});
