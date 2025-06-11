import { inject, Injectable, signal, EventEmitter } from '@angular/core';
import { User } from '../../models/user.models';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface LoginCredentials {
 	username: string,
 	password: string
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private BASE_URL = environment.production ? '/api' : 'http://localhost:3000/api';

 user = signal<User | undefined | null>(undefined);
 loginEvent = new EventEmitter<User | null | undefined>(); // Define loginEvent with proper type

 login(credentials: LoginCredentials): Observable<User | null | undefined> {
 		return this.http.post(this.BASE_URL + '/sessions/login/', credentials,{
      withCredentials:true
    }).pipe(
 			tap((result: any) => {
 				const user = Object.assign(new User(), result['user']);
 				this.user.set(user);
        this.loginEvent.emit(user); // Emit login event with user containing userId
 			}),
 			map((result: any) => { return this.user(); })
 		)
  }

  getUser(): Observable<User | null | undefined> {
    return this.http.get(this.BASE_URL + '/sessions/me/',{
      withCredentials:true
    }).pipe(
      tap((result: any) => {
        const user = Object.assign(new User(), result);
        this.user.set(user);
      }),
      map((result: any) => { return this.user(); })
   )
  }

  logout() {
    return this.http.get(this.BASE_URL + '/sessions/logout/',{
      withCredentials:true
    }).pipe(
      tap((result: any) => {
        this.user.set(null);
      })
    )
  }

}