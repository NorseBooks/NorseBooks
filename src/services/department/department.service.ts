import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { NBDepartment } from './department.interface';
import { ServiceException } from '../service.exception';

/**
 * Department table name.
 */
export const departmentTableName = 'NB_DEPARTMENT';

/**
 * Department table service.
 */
@Injectable()
export class DepartmentService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
  ) {}

  /**
   * Determine whether or not a department exists.
   *
   * @param departmentID The department's ID.
   * @returns Whether or not the department exists.
   */
  public async departmentExists(departmentID: number): Promise<boolean> {
    const department = await this.dbService.getByID<NBDepartment>(
      departmentTableName,
      departmentID,
    );
    return !!department;
  }

  /**
   * Determine whether or not a department exists by name.
   *
   * @param departmentName The department's name.
   * @returns Whether or not the department exists.
   */
  public async departmentExistsByName(
    departmentName: string,
  ): Promise<boolean> {
    const department = await this.dbService.getByFields<NBDepartment>(
      departmentTableName,
      { name: departmentName },
    );
    return !!department;
  }

  /**
   * Get the name of a department.
   *
   * @param departmentID The department's ID.
   * @returns The name of the department.
   */
  public async getDepartmentName(departmentID: number): Promise<string> {
    const department = await this.dbService.getByID<NBDepartment>(
      departmentTableName,
      departmentID,
    );

    if (department) {
      return department.name;
    } else {
      throw new ServiceException('Department does not exist');
    }
  }

  /**
   * Get all departments.
   *
   * @returns All departments.
   */
  public async getDepartments(): Promise<NBDepartment[]> {
    const departments = await this.dbService.list<NBDepartment>(
      departmentTableName,
      { fieldName: 'name', sortOrder: 'ASC' },
    );
    return departments;
  }
}
