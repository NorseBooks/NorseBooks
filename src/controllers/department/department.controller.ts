/**
 * Department controller.
 * @packageDocumentation
 */

import { Controller, UseInterceptors, Get } from '@nestjs/common';
import { DepartmentService } from '../../services/department/department.service';
import { NBDepartment } from '../../services/department/department.interface';
import { QueryNumber } from '../../decorators/query-number.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Department controller.
 */
@Controller('api/department')
@UseInterceptors(new ResponseInterceptor())
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /**
   * Get the name of a department.
   *
   * @param departmentID The department ID.
   * @returns The name of the department.
   */
  @Get()
  public async getDepartment(
    @QueryNumber({ name: 'departmentID' }) departmentID: number,
  ): Promise<string> {
    return this.departmentService.getDepartmentName(departmentID);
  }

  /**
   * Get all departments.
   *
   * @returns All departments.
   */
  @Get('all')
  public async getDepartments(): Promise<NBDepartment[]> {
    return this.departmentService.getDepartments();
  }
}
