
enum estadoViaje{
    'pendiente',
    'enCurso',
    'cancelado',
    'finalizado',
}

export interface Usuario {
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    correo: string;
}

export interface Viaje {
    estado: estadoViaje;
    piloto: Usuario;
    pasajeros: Usuario[];
    destino: string;
}

export interface Auto {
    marca: string;
    modelo: string;
    patente: string;
    propietario: Usuario;
}