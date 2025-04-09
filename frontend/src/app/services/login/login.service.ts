import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../models/user.models';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

export interface LoginCredentials {
 	username: string,
 	password: string
}

@Injectable({ providedIn: 'root' })
export class LoginService {

 private http = inject(HttpClient);
 private BASE_URL = 'http://localhost:3000';

 user = signal<User | undefined | null>(undefined);

 login(credentials: LoginCredentials): Observable<User | null | undefined> {

 		return this.http.post(this.BASE_URL + '/sessions/login/', credentials).pipe(
 			tap((result: any) => {
 				localStorage.setItem('token', result['token']);
 				const user = Object.assign(new User(), result['user']);
 				this.user.set(user);
 			}),
 			map((result: any) => { return this.user(); })
 		)
  }

  getUser(): Observable<User | null | undefined> {
    return this.http.get(this.BASE_URL + '/sessions/me/').pipe(
      tap((result: any) => {
        const user = Object.assign(new User(), result);
        this.user.set(user);
      }),
      map((result: any) => { return this.user(); })
   )
  }

  logout() {
    return this.http.get(this.BASE_URL + '/sessions/logout/').pipe(
      tap((result: any) => {
        localStorage.removeItem('token');
        this.user.set(null);
      })
    )
  }

}