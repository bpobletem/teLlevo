import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth, getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Usuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore)
  auth = inject(Auth)
  constructor() { }


  /// auth

  signIn(user: Usuario){
    return signInWithEmailAndPassword(getAuth(), user.correo, user.password)
  }

  getCollectionChanges<tipo>(path: string) {
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection) as Observable<tipo[]>;
  }
}
