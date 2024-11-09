import { DatetimeChangeEventDetail } from "@ionic/angular";

export enum estadoViaje{
    'pendiente',
    'enCurso',
    'cancelado',
    'finalizado',
}

export interface Usuario {
    uid: string
    correo: string;
    nombre: string;
    apellido: string;
    password: string;
    esConductor: boolean;
}

export interface Viaje {
    estado: estadoViaje;
    piloto: Usuario;
    pasajeros: Usuario[];
    destino: string;
    fechaSalida: string;
    auto: Auto;
    precio: number;
}

export interface Auto {
    marca: string;
    modelo: string;
    patente: string;
    propietario: string; //uid del usuario como referencia
}