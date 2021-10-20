/**
 * Resource service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { NBResource, ResourceMap } from './resource.interface';
import { ServiceException } from '../service.exception';

/**
 * Resource table name.
 */
export const resourceTableName = 'NB_RESOURCE';

/**
 * Resource table service.
 */
@Injectable()
export class ResourceService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
  ) {}

  /**
   * Determine whether or not an app resource exists.
   *
   * @param name The name of the resource.
   * @returns Whether or not the resource exists.
   */
  public async resourceExists(name: string): Promise<boolean> {
    const resource = await this.dbService.getByFields<
      NBResource<boolean | number | string>
    >(resourceTableName, { name });
    return !!resource;
  }

  /**
   * Get an app resource.
   *
   * @param name The name of the resource.
   * @returns The value of the requested resource.
   */
  public async getResource<T extends boolean | number | string>(
    name: string,
  ): Promise<T> {
    const resource = await this.dbService.getByFields<NBResource<T>>(
      resourceTableName,
      { name },
    );

    if (resource) {
      switch (resource.type) {
        case 'BOOLEAN':
          switch (resource.value) {
            case 'true':
              return true as T;
            case 'false':
              return false as T;
            default:
              throw new ServiceException('Failed to parse resource to boolean');
          }

        case 'NUMBER':
          const value = parseFloat(resource.value as string);

          if (!isNaN(value)) {
            return value as T;
          } else {
            throw new ServiceException('Failed to parse resource to number');
          }

        case 'STRING':
          return resource.value as T;

        default:
          throw new ServiceException('Invalid resource type');
      }
    } else {
      throw new ServiceException('Resource does not exist');
    }
  }

  /**
   * Set an app resource's value.
   *
   * @param name The name of the resource.
   * @param value The new value of the resource.
   * @returns The updated resource record.
   */
  public async setResource<T extends boolean | number | string>(
    name: string,
    value: T,
  ): Promise<NBResource<T>> {
    const resource = await this.dbService.getByFields<NBResource<T>>(
      resourceTableName,
      { name },
    );

    if (resource) {
      switch (resource.type) {
        case 'BOOLEAN':
          if (
            typeof value !== 'boolean' &&
            value !== 'true' &&
            value !== 'false'
          ) {
            throw new ServiceException('Resource type must be boolean');
          }
          break;

        case 'NUMBER':
          const numberValue = parseFloat(value.toString());

          if (typeof value !== 'number' && isNaN(numberValue)) {
            throw new ServiceException('Resource type must be number');
          }
          break;
      }

      const resources = await this.dbService.updateByFields<NBResource<T>>(
        resourceTableName,
        { name },
        { value: value.toString() },
      );

      switch (resources[0].type) {
        case 'BOOLEAN':
          return {
            ...resources[0],
            value: (resources[0].value === 'true' ? true : false) as T,
          };
        case 'NUMBER':
          return {
            ...resources[0],
            value: parseFloat(resources[0].value as string) as T,
          };
        case 'STRING':
          return resources[0];
      }
    } else {
      throw new ServiceException('Resource does not exist');
    }
  }

  /**
   * Reset an app resource's value.
   *
   * @param name The name of the resource.
   * @returns The updated resource record.
   */
  public async resetResource<T extends boolean | number | string>(
    name: string,
  ): Promise<NBResource<T>> {
    const resourceArray = await this.dbService.getStaticTable(
      resourceTableName,
    );
    const defaultResources = resourceArray.reduce((acc, resource) => {
      switch (resource.type) {
        case 'BOOLEAN':
          acc[resource.name] = resource.value === 'true' ? true : false;
          break;
        case 'NUMBER':
          acc[resource.name] = parseFloat(resource.value as string);
          break;
        case 'STRING':
          acc[resource.name] = resource.value;
          break;
      }

      return acc;
    }, {});

    return this.setResource<T>(name, defaultResources[name]);
  }

  /**
   * Get all app resources.
   *
   * @returns All resources.
   */
  public async getResources(): Promise<ResourceMap> {
    const resources = await this.dbService.list<
      NBResource<boolean | number | string>
    >(resourceTableName, { fieldName: 'name', sortOrder: 'ASC' });

    return resources.reduce((acc, resource) => {
      switch (resource.type) {
        case 'BOOLEAN':
          acc[resource.name] = resource.value === 'true' ? true : false;
          break;
        case 'NUMBER':
          acc[resource.name] = parseFloat(resource.value as string);
          break;
        case 'STRING':
          acc[resource.name] = resource.value;
          break;
      }

      return acc;
    }, {});
  }
}
