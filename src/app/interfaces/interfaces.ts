
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
    pasajeros: Array<Usuario>;
    destino: string;
}

