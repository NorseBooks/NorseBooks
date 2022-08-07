import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Terms and conditions service.
 */
@Injectable({
  providedIn: 'root',
})
export class TermsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get the site terms and conditions.
   *
   * @returns The terms and conditions document.
   */
  public async getTerms(): Promise<string> {
    return new Promise((resolve) => {
      this.http
        .get<string>('/assets/doc/terms.md', { responseType: 'text' as 'json' })
        .subscribe((res) => resolve(res));
    });
  }
}
