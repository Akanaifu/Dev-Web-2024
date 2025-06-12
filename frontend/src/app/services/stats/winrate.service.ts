import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Ensure the service is provided at the root level
})
export class WinRateService {
  private baseUrl = '/api/stats'; // Backend API base URL

  constructor(private http: HttpClient) {}

  // Fetch win rate data for a specific user
  getWinRateByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/winrate`);
  }
  // Fetch nombre de parties par user spécifique
  getNombrePartiesByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/numberOfGame`);
  }
}