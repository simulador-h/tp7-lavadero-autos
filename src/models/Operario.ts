/* eslint-disable max-classes-per-file, no-underscore-dangle */
import { Auto, ISerializableAuto } from 'models/Auto';
import { ProbabilityDistribution } from 'models/ProbabilityDistribution';

export enum TipoOperario {
  Desmontado = 'Desmontado',
  Montado = 'Montado',
  Aspirado = 'Aspirado',
  Lavado = 'Lavado',
  Secado = 'Secado',
}

export enum EstadoOperario {
  Libre = 'Libre',
  Ocupado = 'Ocupado',
  Bloqueado = 'Bloqueado',
}

export interface ISerializableOperario {
  id: number
  tipo: string

  estado: string
  auto?: ISerializableAuto

  tiempoOcupado: number
  bloqueos: number

  descripcion: string
}

export class Operario {
  readonly id: number;
  readonly tipo: TipoOperario;

  estado: EstadoOperario;
  cola: Auto[];
  operariosBloqueantes?: Operario[];
  auto?: Auto;

  tiempoOcupado: number;
  bloqueos: number;

  constructor(id: number, tipo: TipoOperario, cola: Auto[], operariosBloqueantes?: Operario[]) {
    this.id = id;
    this.tipo = tipo;

    this.cola = cola;
    this.operariosBloqueantes = operariosBloqueantes;

    this.estado = EstadoOperario.Libre;
    this.tiempoOcupado = 0;
    this.bloqueos = 0;
  }

  isBloqueado() {
    return (this.operariosBloqueantes && this.operariosBloqueantes.length)
      ? this.operariosBloqueantes.every(({ estado }) => estado !== EstadoOperario.Libre)
      : false;
  }

  getProbabilidadOcupado(tiempoTotal: number) {
    return this.tiempoOcupado / tiempoTotal;
  }

  getProbabilidadBloqueado(cantidadTotal: number) {
    return this.bloqueos / cantidadTotal;
  }

  acumularTiempoOcupado(tiempoOcupado = 0) {
    this.tiempoOcupado += tiempoOcupado;
  }

  acumularBloqueos(bloqueos = 1) {
    this.bloqueos += bloqueos;
  }

  getDescripcion() {
    return `Operario (${this.tipo.charAt(0)}${this.id})`;
  }

  toSerializable(): ISerializableOperario {
    return {
      id: this.id,
      tipo: this.tipo,
      estado: this.estado,

      auto: this.auto?.toSerializable(),

      tiempoOcupado: this.tiempoOcupado,
      bloqueos: this.bloqueos,

      descripcion: this.getDescripcion(),
    };
  }
}

export class OperarioMontado extends Operario {
  tiempoMontado: number;

  constructor(id: number, tiempoMontado: number, cola: Auto[]) {
    super(id, TipoOperario.Montado, cola);
    this.tiempoMontado = tiempoMontado;
  }

  iniciarMontado(reloj: number, auto: Auto) {
    this.estado = EstadoOperario.Ocupado;
    this.auto = auto;

    auto.iniciarMontado(reloj, this.tiempoMontado);
  }

  finalizarMontado(reloj: number, auto = this.cola.shift()): Auto {
    this.acumularTiempoOcupado(
      this.auto?.tiempoMontado,
    );

    this.auto?.finalizarMontado();
    const _auto = this.auto as Auto;

    if (auto) {
      this.iniciarMontado(reloj, auto);
    }
    else {
      this.estado = EstadoOperario.Libre;
      this.auto = undefined;
    }

    return _auto;
  }
}

export class OperarioSecado extends Operario {
  tiempoSecado: number;

  constructor(id: number, tiempoSecado: number, cola: Auto[]) {
    super(id, TipoOperario.Secado, cola);
    this.tiempoSecado = tiempoSecado;
  }

  iniciarSecado(reloj: number, auto: Auto) {
    this.estado = EstadoOperario.Ocupado;
    this.auto = auto;

    auto.iniciarSecadoCarroceria(reloj, this.tiempoSecado);
  }

  finalizarSecado(reloj: number, auto = this.cola.shift()): Auto {
    this.acumularTiempoOcupado(
      this.auto?.carroceria.tiempoSecado,
    );

    this.auto?.finalizarSecadoCarroceria();
    const _auto = this.auto as Auto;

    if (auto) {
      this.iniciarSecado(reloj, auto);
    }
    else {
      this.estado = EstadoOperario.Libre;
      this.auto = undefined;
    }

    return _auto;
  }
}

export class OperarioLavado extends Operario {
  tiempoLavado: ProbabilityDistribution;

  constructor(id: number, tiempoLavado: ProbabilityDistribution, cola: Auto[], operariosBloqueantes: OperarioSecado[]) {
    super(id, TipoOperario.Lavado, cola, operariosBloqueantes);
    this.tiempoLavado = tiempoLavado;
  }

  iniciarLavado(reloj: number, auto: Auto) {
    this.estado = EstadoOperario.Ocupado;
    this.auto = auto;

    auto.iniciarLavadoCarroceria(reloj, this.tiempoLavado.sample());
  }

  finalizarLavado(): Auto {
    this.acumularTiempoOcupado(
      this.auto?.carroceria.tiempoLavado,
    );

    this.auto?.finalizarLavadoCarroceria();
    const _auto = this.auto as Auto;

    if (this.isBloqueado()) {
      this.acumularBloqueos();
    }

    this.estado = EstadoOperario.Bloqueado;

    return _auto;
  }
}

export class OperarioAspirado extends Operario {
  tiempoAspirado: ProbabilityDistribution;

  constructor(id: number, tiempoAspirado: ProbabilityDistribution, cola: Auto[]) {
    super(id, TipoOperario.Aspirado, cola);
    this.tiempoAspirado = tiempoAspirado;
  }

  iniciarAspirado(reloj: number, auto: Auto) {
    this.estado = EstadoOperario.Ocupado;
    this.auto = auto;

    auto.iniciarAspiradoAlfombra(reloj, this.tiempoAspirado.sample());
  }

  finalizarAspirado(reloj: number, auto = this.cola.shift()): Auto {
    this.acumularTiempoOcupado(
      this.auto?.alfombra.tiempoAspirado,
    );

    this.auto?.finalizarAspiradoAlfombra();
    const _auto = this.auto as Auto;

    if (auto) {
      this.iniciarAspirado(reloj, auto);
    }
    else {
      this.estado = EstadoOperario.Libre;
      this.auto = undefined;
    }

    return _auto;
  }
}

export class OperarioDesmontado extends Operario {
  tiempoDesmontado: number;

  constructor(id: number, tiempoDesmontado: number, cola: Auto[]) {
    super(id, TipoOperario.Desmontado, cola);
    this.tiempoDesmontado = tiempoDesmontado;
  }

  iniciarDesmontado(reloj: number, auto: Auto) {
    this.estado = EstadoOperario.Ocupado;
    this.auto = auto;

    auto.iniciarDesmontado(reloj, this.tiempoDesmontado);
  }

  finalizarDesmontado(reloj: number, auto = this.cola.shift()): Auto {
    this.acumularTiempoOcupado(
      this.auto?.tiempoDesmontado,
    );

    this.auto?.finalizarDesmontado();
    const _auto = this.auto as Auto;

    if (auto) {
      this.iniciarDesmontado(reloj, auto);
    }
    else {
      this.estado = EstadoOperario.Libre;
      this.auto = undefined;
    }

    return _auto;
  }
}
