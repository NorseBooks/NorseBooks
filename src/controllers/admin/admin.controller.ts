/**
 * Admin controller.
 * @packageDocumentation
 */

import { Controller, UseGuards, UseInterceptors, Get } from '@nestjs/common';
import { AdminService } from '../../services/admin/admin.service';
import {
  AdminStats,
  AdminDatabaseUsage,
  AdminUser,
} from '../../services/admin/admin.interface';
import { NBBook } from '../../services/book/book.interface';
import { AdminGuard } from '../../guards/admin.guard';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Admin controller.
 */
@Controller('api/admin')
@UseInterceptors(new ResponseInterceptor())
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get site statistics.
   *
   * @returns Site statistics.
   */
  @Get('stats')
  @UseGuards(AdminGuard)
  public async getStats(): Promise<AdminStats> {
    return this.adminService.getStats();
  }

  /**
   * Get all users on the site.
   *
   * @returns All users on the site.
   */
  @Get('users')
  @UseGuards(AdminGuard)
  public async getUsers(): Promise<AdminUser[]> {
    const users = await this.adminService.getUsers();

    return users.map((user) => ({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      imageID: user.imageID,
      numBooksListed: user.numBooksListed,
      numBooksSold: user.numBooksSold,
      moneyMade: user.moneyMade,
      verified: user.verified,
      admin: user.admin,
      joinTime: user.joinTime,
    }));
  }

  /**
   * Get all books on the site.
   *
   * @returns All books on the site.
   */
  @Get('books')
  @UseGuards(AdminGuard)
  public async getBooks(): Promise<NBBook[]> {
    return this.adminService.getBooks();
  }

  /**
   * Get the database usage statistics.
   *
   * @returns The database usage statistics.
   */
  @Get('database-usage')
  @UseGuards(AdminGuard)
  public async getDatabaseUsage(): Promise<AdminDatabaseUsage> {
    return this.adminService.getDatabaseUsage();
  }
}
