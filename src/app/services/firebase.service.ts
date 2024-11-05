import { inject, Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, setDoc, getFirestore, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
import { Usuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  firestore: Firestore = inject(Firestore)
  auth = inject(Auth)
  constructor() { }


  // auth
  signIn(user: Usuario){
    return signInWithEmailAndPassword(getAuth(), user.correo, user.password);
  }

  signUp(user: Usuario){
    return createUserWithEmailAndPassword(getAuth(), user.correo, user.password);
  }

  updateUser(displayName: string){
    return updateProfile(getAuth().currentUser, {displayName});
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email)
  }

  // db
  getCollectionChanges<tipo>(path: string) {
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection) as Observable<tipo[]>;
  }

  async getDocument(path: string) {
    const document = doc(getFirestore(), path);
    return (await getDoc(document)).data();
  }

  setDocument(path: string, data: any) {
    const document = doc(getFirestore(), path);
    return setDoc(document, data);
  }

}
