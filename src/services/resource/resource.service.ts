import { Injectable } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { NBResource } from './resource.interface';

/**
 * Resource table service.
 */
@Injectable()
export class ResourceService {
  private readonly tableName = 'NB_RESOURCE';

  constructor(private readonly dbService: DBService) {}

  /**
   * Determine whether or not an app resource exists.
   *
   * @param name The name of the resource.
   * @returns Whether or not the resource exists.
   */
  public async resourceExists(name: string): Promise<boolean> {
    const resource = await this.dbService.getByFields<NBResource>(
      this.tableName,
      { name },
    );
    return !!resource;
  }

  /**
   * Get an app resource.
   *
   * @param name The name of the resource.
   * @returns The value of the requested resource, or undefined if it does not exist.
   */
  public async getResource(name: string): Promise<string | undefined> {
    const resource = await this.dbService.getByFields<NBResource>(
      this.tableName,
      { name },
    );
    return resource?.value;
  }

  /**
   * Get all app resources.
   *
   * @returns All resources.
   */
  public async getResources(): Promise<{ [name: string]: string }> {
    const resources = await this.dbService.list<NBResource>(this.tableName, {
      fieldName: 'name',
      sortOrder: 'ASC',
    });

    return resources.reduce((acc, current) => {
      acc[current.name] = current.value;
      return acc;
    }, {});
  }
}
