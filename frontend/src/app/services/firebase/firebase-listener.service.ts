// filepath: src/app/services/firebase-listener.service.ts
import { Injectable } from '@angular/core';
import { Database, ref, onChildAdded } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class FirebaseListenerService {
  constructor(private db: Database) {}

  listenForNewEntries(path: string, callback: (data: any) => void): void {
    const dbRef = ref(this.db, path);
    onChildAdded(dbRef, (snapshot) => {
      const newData = snapshot.val();
      console.log('New entry detected:', newData);
      callback(newData);
    });
  }
}
