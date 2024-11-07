import { inject, Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, setDoc, getFirestore, getDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
import { Usuario } from '../interfaces/interfaces';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  firestore: Firestore = inject(Firestore)
  auth = inject(Auth)
  storageSrv = inject(StorageService);
  router = inject(Router);
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

  signOut() {
    getAuth().signOut();
    this.storageSrv.remove('sesion');
    this.router.navigate(['/iniciar-sesion']);
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

  //get document with query
  async getDocumentsByReference(path: string, referenceField: string, referenceValue: any) {
    const itemCollection = collection(this.firestore, path);
    const q = query(itemCollection, where(referenceField, '==', referenceValue));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => doc.data());
    return results;
  }

  

}
