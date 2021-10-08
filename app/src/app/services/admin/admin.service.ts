import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { AdminStats, AdminDatabaseUsage, AdminUser } from './admin.interface';
import { NBBook } from '../book/book.interface';

/**
 * Admin service.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Get site statistics.
   *
   * @returns Site statistics.
   */
  public async getStats(): Promise<AdminStats> {
    return this.apiService.get<AdminStats>('admin/stats');
  }

  /**
   * Get all users on the site.
   *
   * @returns All users on the site.
   */
  public async getUsers(): Promise<AdminUser[]> {
    return this.apiService.get<AdminUser[]>('admin/users');
  }

  /**
   * Get all books on the site.
   *
   * @returns All books on the site.
   */
  public async getBooks(): Promise<NBBook[]> {
    return this.apiService.get<NBBook[]>('admin/books');
  }

  /**
   * Get the database usage statistics.
   *
   * @returns The database usage statistics.
   */
  public async getDatabaseUsage(): Promise<AdminDatabaseUsage> {
    return this.apiService.get<AdminDatabaseUsage>('admin/database-usage');
  }
}
