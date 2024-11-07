import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/interfaces';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  firebaseSrv = inject(FirebaseService);
  utilsSrv = inject(UtilsService);

  currentUser: Usuario;

  constructor(private router: Router) {}

  signOut() {
    this.firebaseSrv.signOut();
    this.utilsSrv.presentToast({
      message: "Sesión cerrada con éxito",
      duration: 2500,
      color: 'primary',
      position: 'bottom',
      icon: 'alert-circle-outline'
    })
  }

  ngOnInit(): void {
    this.loadUser();
  }

  async loadUser() {
    try {
      const uid = this.firebaseSrv.auth.currentUser.uid;
      const user = await this.firebaseSrv.getDocument(`Usuario/${uid}`);
      if (user) {
        this.currentUser = user as Usuario;
        console.log(this.currentUser);
      } else {
        console.error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
    }
  }
}
