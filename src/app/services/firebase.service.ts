import { inject, Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, setDoc, getFirestore, getDoc, query, where, getDocs, arrayUnion, updateDoc  } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, onAuthStateChanged } from '@angular/fire/auth';
import { Usuario } from '../interfaces/interfaces';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { addDoc } from 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  auth = inject(Auth)

  constructor(private firestore: Firestore, private router: Router, private storageSrv: StorageService) {
    this.auth = getAuth();
  }


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

  async checkAndClearSession(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      // Verifica el estado de autenticación en Firebase
      onAuthStateChanged(this.auth, async (user) => {
        const storedSession = await this.storageSrv.get('sesion');
        
        if (user && storedSession) {
          // Si hay un usuario en Firebase y en el storage, la sesión está activa
          resolve(true);
        } else {
          // Si no hay usuario en Firebase o el UID no está en el storage, cierra sesión
          await this.storageSrv.remove('sesion');
          resolve(false);
        }
      });
    });
  }

  // db
  getCollectionChanges<T>(path: string): Observable<T[]> {
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection, { idField: 'id' }) as Observable<T[]>;
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

  updateDocument(path: string, data: any) {
    const documentRef = doc(this.firestore, path);
    return setDoc(documentRef, data, { merge: true });
  }  

  async addPassengerToArray(viajeId: string, passenger: any): Promise<void> {
    const viajeRef = doc(this.firestore, `Viajes/${viajeId}`);
    await updateDoc(viajeRef, {
      pasajeros: arrayUnion(passenger)
    });
  }
  
  async addDocument(collectionPath: string, data: any) {
    const itemCollection = collection(this.firestore, collectionPath);
    const docRef = await addDoc(itemCollection, data);
    return docRef.id; // Return the document ID for reference if needed
  }

  async getDocumentById(collectionPath: string, docId: string) {
    const docRef = doc(this.firestore, `${collectionPath}/${docId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Document not found');
    }
  }
}
 