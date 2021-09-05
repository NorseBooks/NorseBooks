import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBDepartment } from './department.interface';

/**
 * Department service.
 */
@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Get the name of a department.
   *
   * @param departmentID The department ID.
   * @returns The name of the department.
   */
  public async getDepartment(departmentID: string): Promise<string> {
    return this.apiService.get<string>('department', {
      query: { departmentID },
    });
  }

  /**
   * Get all departments.
   *
   * @returns All departments.
   */
  public async getDepartments(): Promise<NBDepartment[]> {
    return this.apiService.get<NBDepartment[]>('department/all');
  }
}
