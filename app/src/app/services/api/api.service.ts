import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * The API subpath.
 */
const apiPath = '/api/';

/**
 * Query or body parameters.
 */
interface Params {
  [param: string]: any;
}

/**
 * Get request options.
 */
interface GetOptions {
  query?: Params;
}

/**
 * Post request options.
 */
interface PostOptions {
  query?: Params;
  body?: Params;
}

/**
 * Patch request options.
 */
interface PatchOptions {
  query?: Params;
  body?: Params;
}

/**
 * Delete request options.
 */
interface DeleteOptions {
  query?: Params;
}

/**
 * Standard response object.
 */
export interface Response<T> {
  data?: T;
  statusCode?: number;
  message?: string;
  error?: string;
}

/**
 * API request service.
 */
@Injectable({
  providedIn: 'root',
})
export class APIService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Make a GET request.
   *
   * @param path The URL path.
   * @param options Request options.
   * @returns The response data.
   */
  public async get<T = void>(
    path: string,
    options: GetOptions = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http
        .get<Response<T>>(apiPath + path, {
          params: options.query,
          withCredentials: true,
        })
        .subscribe(
          (res) => {
            if (!res.message) {
              resolve(res.data as T);
            } else {
              reject(res.message);
            }
          },
          (err) => reject(err?.error?.message),
        );
    });
  }

  /**
   * Make a POST request.
   *
   * @param path The URL path.
   * @param options Request options.
   * @returns The response data.
   */
  public async post<T = void>(
    path: string,
    options: PostOptions = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http
        .post<Response<T>>(apiPath + path, options.body, {
          params: options.query,
          withCredentials: true,
        })
        .subscribe(
          (res) => {
            if (!res.message) {
              resolve(res.data as T);
            } else {
              reject(res.message);
            }
          },
          (err) => reject(err?.error?.message),
        );
    });
  }

  /**
   * Make a PATCH request.
   *
   * @param path The URL path.
   * @param options Request options.
   * @returns The response data.
   */
  public async patch<T = void>(
    path: string,
    options: PatchOptions = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http
        .patch<Response<T>>(apiPath + path, options.body, {
          params: options.query,
          withCredentials: true,
        })
        .subscribe(
          (res) => {
            if (!res.message) {
              resolve(res.data as T);
            } else {
              reject(res.message);
            }
          },
          (err) => reject(err?.error?.message),
        );
    });
  }

  /**
   * Make a DELETE request.
   *
   * @param path The URL path.
   * @param options Request options.
   * @returns The response data.
   */
  public async delete<T = void>(
    path: string,
    options: DeleteOptions = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http
        .delete<Response<T>>(apiPath + path, {
          params: options.query,
          withCredentials: true,
        })
        .subscribe(
          (res) => {
            if (!res.message) {
              resolve(res.data as T);
            } else {
              reject(res.message);
            }
          },
          (err) => reject(err?.error?.message),
        );
    });
  }
}
