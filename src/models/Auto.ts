export enum EstadoAuto {
  EsperandoDesmontado = 'Esperando Desmontado',
  SiendoDesmontado = 'Siendo Desmontado',

  Desmontado = 'Desmontado',

  EsperandoAlfombra = 'Esperando Alfombra',
  EsperandoCarroceria = 'Esperando Carroceria',
  EsperandoMontado = 'Esperando Montado',
  SiendoMontado = 'Siendo Montado',

  Montado = 'Montado',
}

export enum EstadoAlfombra {
  EsperandoAspirado = 'Esperando Aspirado',
  SiendoAspirado = 'Siendo Aspirada',
  Aspirado = 'Aspirada',
}

export enum EstadoCarroceria {
  EsperandoLavado = 'Esperando Lavado',
  SiendoLavado = 'Siendo Lavada',

  EsperandoSecado = 'Esperando Secado',
  SiendoSecado = 'Siendo Secada',

  Lavado = 'Lavada',
  Secado = 'Secada',
}

export interface ISerializableAuto {
  id: number
  tiempoLlegada: number
  estado: string

  inicioDesmontado?: number
  tiempoDesmontado?: number
  finDesmontado?: number

  alfombra: {
    estado?: string

    inicioAspirado?: number
    tiempoAspirado?: number
    finAspirado?: number
  }

  carroceria: {
    estado?: string

    inicioLavado?: number
    tiempoLavado?: number
    finLavado?: number

    inicioSecado?: number
    tiempoSecado?: number
    finSecado?: number
  }

  inicioMontado?: number
  tiempoMontado?: number
  finMontado?: number

  descripcion: string
}

export class Auto {
  readonly id: number;
  tiempoLlegada: number;
  estado: EstadoAuto;

  inicioDesmontado?: number;
  tiempoDesmontado?: number;
  finDesmontado?: number;

  alfombra: {
    estado?: EstadoAlfombra

    inicioAspirado?: number;
    tiempoAspirado?: number;
    finAspirado?: number;
  }

  carroceria: {
    estado?: EstadoCarroceria

    inicioLavado?: number;
    tiempoLavado?: number;
    finLavado?: number;

    inicioSecado?: number;
    tiempoSecado?: number;
    finSecado?: number;
  }

  inicioMontado?: number;
  tiempoMontado?: number;
  finMontado?: number;

  constructor(
    id: number, tiempoLlegada: number,
  ) {
    this.id = id;
    this.tiempoLlegada = tiempoLlegada;

    this.estado = EstadoAuto.EsperandoDesmontado;

    this.alfombra = {};
    this.carroceria = {};
  }

  iniciarDesmontado(reloj: number, tiempoDesmontado: number) {
    this.estado = EstadoAuto.SiendoDesmontado;

    this.inicioDesmontado = reloj;
    this.tiempoDesmontado = tiempoDesmontado;
    this.finDesmontado = reloj + tiempoDesmontado;
  }

  finalizarDesmontado() {
    this.estado = EstadoAuto.Desmontado;

    this.alfombra.estado = EstadoAlfombra.EsperandoAspirado;
    this.carroceria.estado = EstadoCarroceria.EsperandoLavado;
  }

  iniciarAspiradoAlfombra(reloj: number, tiempoAspirado: number) {
    this.alfombra.estado = EstadoAlfombra.SiendoAspirado;

    this.alfombra.inicioAspirado = reloj;
    this.alfombra.tiempoAspirado = tiempoAspirado;
    this.alfombra.finAspirado = reloj + tiempoAspirado;
  }

  finalizarAspiradoAlfombra() {
    this.alfombra.estado = EstadoAlfombra.Aspirado;

    if (this.estado === EstadoAuto.EsperandoAlfombra) {
      this.estado = EstadoAuto.EsperandoMontado;
    }
    else {
      this.estado = EstadoAuto.EsperandoCarroceria;
    }
  }

  iniciarLavadoCarroceria(reloj: number, tiempoLavado: number) {
    this.carroceria.estado = EstadoCarroceria.SiendoLavado;

    this.carroceria.inicioLavado = reloj;
    this.carroceria.tiempoLavado = tiempoLavado;
    this.carroceria.finLavado = reloj + tiempoLavado;
  }

  finalizarLavadoCarroceria() {
    this.carroceria.estado = EstadoCarroceria.EsperandoSecado;
  }

  iniciarSecadoCarroceria(reloj: number, tiempoSecado: number) {
    this.carroceria.estado = EstadoCarroceria.SiendoSecado;

    this.carroceria.inicioSecado = reloj;
    this.carroceria.tiempoSecado = tiempoSecado;
    this.carroceria.finSecado = reloj + tiempoSecado;
  }

  finalizarSecadoCarroceria() {
    this.carroceria.estado = EstadoCarroceria.Secado;

    if (this.estado === EstadoAuto.EsperandoCarroceria) {
      this.estado = EstadoAuto.EsperandoMontado;
    }
    else {
      this.estado = EstadoAuto.EsperandoAlfombra;
    }
  }

  iniciarMontado(reloj: number, tiempoMontado: number) {
    this.estado = EstadoAuto.SiendoMontado;

    this.inicioMontado = reloj;
    this.tiempoMontado = tiempoMontado;
    this.finMontado = reloj + tiempoMontado;
  }

  finalizarMontado() {
    this.estado = EstadoAuto.Montado;
  }

  getDescripcion() {
    return `Auto (${this.id})`;
  }

  toSerializable(): ISerializableAuto {
    return {
      id: this.id,
      tiempoLlegada: this.tiempoLlegada,
      estado: this.estado,

      inicioDesmontado: this.inicioDesmontado,
      tiempoDesmontado: this.tiempoDesmontado,
      finDesmontado: this.finDesmontado,

      alfombra: {
        ...this.alfombra,
      },

      carroceria: {
        ...this.carroceria,
      },

      inicioMontado: this.inicioMontado,
      tiempoMontado: this.tiempoMontado,
      finMontado: this.finMontado,

      descripcion: this.getDescripcion(),
    };
  }
}
