import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api/users'; // Replace with your backend URL

  balanceChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private http: HttpClient) {}

  // ...existing methods...

  getUserBalance(userId: number): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(
      `${this.apiUrl}/${userId}/balance`
    );
  }

  getUserId(): Observable<{ solde: number; user_id: number }> {
    return this.http.get<{ solde: number; user_id: number }>(
      '/api/get_id/info',
      { withCredentials: true }
    );
  }

  updateUserBalance(
    userId: number,
    amount: number,
    operation: 'add' | 'subtract'
  ): Observable<any> {
    if (
      userId === null ||
      userId === undefined ||
      amount === null ||
      amount === undefined ||
      operation === null ||
      operation === undefined ||
      (operation !== 'add' && operation !== 'subtract')
    ) {
      return throwError(() => new Error('Invalid arguments'));
    }

    let url = '';
    if (operation === 'add') {
      url = `${this.apiUrl}/balance/add`;
    } else if (operation === 'subtract') {
      url = `${this.apiUrl}/balance/subtract`;
    }

    // Utilise PUT au lieu de POST
    return this.http.put(url, { userId, value: amount });
  }
}
