import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs'

import { environment } from 'src/environments/environment';
// import * as prodEnv from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private backendUrl = 'https://words-api.wehrle.dev/words';//`${environment.backendRootURL}/words`;

  constructor(private http: HttpClient) {
    // this.checkBackend();
  }

  /**
   * @description Validates whether the given word is a real word by sending it to the backend to be checked against a large, 5-letter word database
   * @param {string} word The word to validate
   * @returns {Promise<BackendResponse>}
   */
  public checkWord(word: string): Promise<BackendResponse> {
    // catch some early cases where a word is invalid
    if (!word.match(/^[a-z]{5}$/i)) { // ensures word is exactly 5 letters
      return Promise.resolve({
        success: true,
        testWord: word,
        isTestWordValid: false,
      });
    }
    return this.callBackend(`/validate/${word}`);
  }

  /**
   * @description Retrieves the daily data from the backend, including the word and ransom note of the day.
   * @returns {Promise<BackendResponse>}
   */
  public async getDailyData(): Promise<BackendResponse> {
    return this.callBackend('/daily');
  }

  /**
   * @description Retrieves a randomly generated ransom note from the back end based on the given seed.
   * @param {number} seed - The seed from which the back end will generate a ransom note
   * @returns {Promise<BackendResponse>}
   */
  public getRansom(seed: number): Promise<BackendResponse> {
    return this.callBackend(`/ransom/${seed}`);
  }

  /**
   * @description Will call the backend at the given path, and return the response as a Promise
   * @param {string} path The path parameters to be appended to the backendUrl. Should begin with /
   * @returns {Promise<BackendResponse>}
   */
  private callBackend(path: string): Promise<BackendResponse> {
    if (path.length === 0 || path[0] !== '/') {
      path = `/${path}`;
    }
    return firstValueFrom(this.http.get<BackendResponse>(`${this.backendUrl}${path}`));
  }

  // private async checkBackend(): Promise<void> {
  //   const response = await this.getDailyData(); //TODO - replace with a ping so I am not generating anything on the back end. actually no this is just for dev!
  //   if (!response || !response.success) {
  //     console.log('unable to load backend from this machine!');
  //     this.backendUrl = `${prodEnv.environment.backendRootURL}/words`
  //   }
  // }
}

export interface BackendResponse {
  success: boolean,
  dailyWord?: string,
  ransom?: string,
  testWord?: string,
  isTestWordValid?: boolean,
}