import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvatarUploadService {
  private avatarChanged = new Subject<void>();
  avatarChanged$ = this.avatarChanged.asObservable();

  constructor(private http: HttpClient) {}
  private readonly baseUrl = '/api/avatar/';

  uploadAvatar(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId.toString());
    return this.http.post('/api/avatar/upload-avatar', formData);
  }

  notifyAvatarChanged() {
    this.avatarChanged.next();
  }

  getAvatarUrl(userId: number | undefined | null): string {
    return this.baseUrl + userId
  }

}
