import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, Observable, throwError, firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  readonly backendUrl = `${environment.backendRootURL}/words`;

  constructor(private http: HttpClient) {}

  public checkWord(word: string): Promise<BackendResponse> {
    return this.callBackend(`/validate/${word}`);
  }

  public async getDailyData(): Promise<BackendResponse> {
    return this.callBackend('/daily');
  }

  public getRansom(seed: number): Promise<BackendResponse> {
    return this.callBackend(`/ransom/${seed}`);
  }

  private callBackend(path: string): Promise<BackendResponse> {
    return firstValueFrom(this.http.get<BackendResponse>(`${this.backendUrl}${path}`));
  }

}

export interface BackendResponse {
  success: boolean,
  dailyWord?: string,
  ransom?: string,
  testWord?: string,
  isTestWordValid?: boolean,
}

interface DailyData {
  dailyWord: string,
  ransom: string
}
