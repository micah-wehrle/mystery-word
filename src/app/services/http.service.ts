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

  public async checkWord(word: string): Promise<boolean> {
    const response = await this.callBackend(`/valid/${word}`);
    return response && response.isTestWordValid ? response.isTestWordValid : false;
  }

  public async getDailyData(): Promise<DailyData> {
    const response = await this.callBackend('/daily');
    const output: DailyData = {
      dailyWord: response && response.dailyWord ? response.dailyWord : '',
      ransom: response && response.ransom ? response.ransom : '',
    }

    return output;
  }

  public async getRansom(seed: number): Promise<string> {
    const response = await this.callBackend(`/ransom/${seed}`);
    return response && response.ransom ? response.ransom : '';
  }

  private async callBackend(path: string): Promise<BackendResponse> {
    return await firstValueFrom(this.http.get<BackendResponse>(`${this.backendUrl}${path}`));
  }

}

interface BackendResponse {
  dailyWord?: string,
  ransom?: string,
  testWord?: string,
  isTestWordValid?: boolean,
}

interface DailyData {
  dailyWord: string,
  ransom: string
}
