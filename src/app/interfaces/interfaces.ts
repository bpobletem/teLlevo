export enum estadoViaje {
    pendiente = 'pendiente',
    enCurso = 'enCurso',
    cancelado = 'cancelado',
    finalizado = 'finalizado',
}

export enum EstadoSolicitud {
    pendiente = 'pendiente',
    aprobado = 'aprobado',
    rechazado = 'rechazado',
}

export interface Usuario {
    uid: string;
    correo: string;
    nombre: string;
    apellido: string;
    password: string;
    esConductor: boolean;
}

export interface Viaje {
    id?: string;              
    estado: estadoViaje; 
    piloto: Usuario;            
    pasajeros: Usuario[];        
    destino: string;             
    fechaSalida: string;        
    auto: Auto;            
    precio: number;             
    rutas?: { lat: number; lng: number }[]; 
}

export interface Auto {
    marca: string;
    modelo: string;
    patente: string;
    propietario: string; 
}

export interface SolicitudesViaje {
    viajeId: string;            
    parada: string;             
    pasajeroId: string;         
    estado: EstadoSolicitud;    
}
