import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:3000/stats'; // Utilisation de HTTP pour le serveur local

  constructor(private http: HttpClient) {}

  getUserStats(): Observable<any[]> {
    const userId = 3; // Replace with logic to get the connected user's ID
    return this.http.get<any[]>(`${this.apiUrl}?user_id=${userId}`);
  }

  getUserBets(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bets/${userId}`);
  }
}
