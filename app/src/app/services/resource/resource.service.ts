import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { Resources } from './resource.interface';

/**
 * Resource service.
 */
@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private gotResources = false;
  private getResourcesError = null;
  private resources: Resources = {};

  constructor(private readonly apiService: APIService) {
    this.apiService
      .get<Resources>('resource/all')
      .then((resources) => {
        this.resources = resources;
        this.gotResources = true;
      })
      .catch((err) => {
        this.getResourcesError = err;
        throw err;
      });
  }

  /**
   * Wait for resources.
   */
  private async awaitResources(): Promise<void> {
    while (!this.gotResources && this.getResourcesError === null) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    if (this.getResourcesError !== null) {
      throw this.getResourcesError;
    }
  }

  /**
   * Get all resources.
   *
   * @returns All resources.
   */
  public async getAll(): Promise<Resources> {
    await this.awaitResources();
    return this.resources;
  }

  /**
   * Get a resource.
   *
   * @param name The resource name.
   * @returns The requested resource.
   */
  public async get<T extends boolean | number | string>(
    name: string,
  ): Promise<T> {
    await this.awaitResources();
    return this.resources[name] as T;
  }

  /**
   * Set a resource's value.
   *
   * @param name The resource name.
   * @param value The new resource value.
   */
  public async set<T extends boolean | number | string>(
    name: string,
    value: T,
  ): Promise<void> {
    await this.apiService.patch('resource', { query: { name, value } });
  }

  /**
   * Reset a resource's value.
   *
   * @param name The resource name.
   */
  public async reset(name: string): Promise<void> {
    await this.apiService.patch('resource/reset', { query: { name } });
  }

  /**
   * Update resources.
   */
  public async update(): Promise<void> {
    this.resources = await this.apiService.get<Resources>('resource/all');
  }
}
