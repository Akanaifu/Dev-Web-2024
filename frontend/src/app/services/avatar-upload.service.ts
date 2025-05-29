import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvatarUploadService {
  constructor(private http: HttpClient) {}
  private readonly baseUrl = 'http://localhost:3000/avatar/';

  uploadAvatar(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId.toString());
    return this.http.post('http://localhost:3000/avatar/upload-avatar', formData);
  }

  getAvatarUrl(userId: number | undefined | null): string {
    return this.baseUrl + userId
  }

}
