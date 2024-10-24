import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.scss'],
})
export class EncabezadoComponent  implements OnInit {
  isLoggedIn = false;

  @Input() titulo="";
  constructor(private router: Router) { }

  ngOnInit() {
  }
}