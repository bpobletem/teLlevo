export enum estadoViaje {
    pendiente = 'pendiente',
    enCurso = 'en curso',
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
    asientosDisponibles: number;    
    auto: Auto;            
    precio: number;             
    rutas?: { lat: number; lng: number }[]; 
    center?: { lat: number; lng: number };
    zoom: number;
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
    viaje?: Viaje;
    piloto?: Usuario;
}
