import _ from 'lodash';

import {
  incrementalMean,
} from 'helpers/statistics';

import {
  ProbabilityDistribution,
} from 'models/ProbabilityDistribution';

import {
  Auto,
  ISerializableAuto,
} from 'models/Auto';

import {
  Operario,
  OperarioDesmontado,
  OperarioAspirado,
  OperarioLavado,
  OperarioSecado,
  OperarioMontado,
  EstadoOperario,
  ISerializableOperario,
} from 'models/Operario';

import {
  Sistema,
  ISerializableSistema,
} from 'models/Sistema';

export enum Evento {
  InicioSimulacion = 'Inicio Simulación',
  FinSimulacion = 'Fin Simulación',

  LlegadaAuto = 'Llegada Auto',
  FinDesmontado = 'Fin Desmontado',
  FinMontado = 'Fin Montado',

  FinAspirado = 'Fin Aspirado',

  FinLavado = 'Fin Lavado',
  FinSecado = 'Fin Secado',
}

// @todo move to interfaces/IParameters.ts
interface IParameters {
  tiempoEntreLlegadas: ProbabilityDistribution

  tiempoDesmontado: number
  tiempoMontado: number

  tiempoAspiradoAlfombra: ProbabilityDistribution

  tiempoLavadoCarroceria: ProbabilityDistribution
  tiempoSecadoCarroceria: number
}

export interface IProximoEvento {
  evento: Evento
  reloj: number
  emisor?: Operario
  id?: number
}

export interface ISerializableVectorEstado {
  iteracion: number
  reloj: number
  evento: string
  emisor: ISerializableSistema | ISerializableAuto | ISerializableOperario

  operarios: {
    desmontado: ISerializableOperario
    aspirado: ISerializableOperario
    lavado: [
      ISerializableOperario,
      ISerializableOperario
    ]
    secado: ISerializableOperario
    montado: ISerializableOperario
  }

  colas: {
    desmontado: {
      tamaño: number,
      orden: string,
    }
    aspirado: {
      tamaño: number,
      orden: string,
    }
    lavado: {
      tamaño: number,
      orden: string,
    }
    secado: {
      tamaño: number,
      orden: string,
    }
    montado: {
      tamaño: number,
      orden: string,
    }
  }

  proximaLlegadaAuto?: number

  estadisticos: {
    totalAutosProcesados: number
    tiempoPromedioEnSistema: number
    esperasColaDesmontado: number
    maximaColaDesmontado: number
    esperasColaAspirado: number
    maximaColaAspirado: number
    esperasColaLavado: number
    maximaColaLavado: number
    esperasColaSecado: number
    maximaColaSecado: number
    esperasColaMontado: number
    maximaColaMontado: number
  }
}

export class VectorEstado {
  iteracion: number;
  reloj: number;
  evento: Evento;
  emisor: Sistema | Auto | Operario;

  sistema: Sistema

  operarios: {
    desmontado: OperarioDesmontado
    aspirado: OperarioAspirado
    lavado: [OperarioLavado, OperarioLavado]
    secado: OperarioSecado
    montado: OperarioMontado
  }

  colas: {
    desmontado: Auto[];
    aspirado: Auto[];
    lavado: Auto[];
    secado: Auto[];
    montado: Auto[];
  }

  tiempoEntreLlegadas: ProbabilityDistribution;
  proximaLlegadaAuto: number;
  proximoIdAuto: number;

  estadisticos: {
    totalAutosProcesados: number
    tiempoPromedioEnSistema: number

    esperasColaDesmontado: number
    maximaColaDesmontado: number

    esperasColaAspirado: number
    maximaColaAspirado: number

    esperasColaLavado: number
    maximaColaLavado: number

    esperasColaSecado: number
    maximaColaSecado: number

    esperasColaMontado: number
    maximaColaMontado: number
  }

  constructor(parametros: IParameters) {
    this.sistema = new Sistema();

    this.iteracion = 0;
    this.reloj = 0;
    this.evento = Evento.InicioSimulacion;
    this.emisor = this.sistema;

    this.tiempoEntreLlegadas = parametros.tiempoEntreLlegadas;
    this.proximaLlegadaAuto = this.tiempoEntreLlegadas.sample();
    this.proximoIdAuto = 1;

    this.colas = {
      desmontado: [],
      aspirado: [],
      lavado: [],
      secado: [],
      montado: [],
    };

    const operarioDesmontado = new OperarioDesmontado(1, parametros.tiempoDesmontado, this.colas.desmontado);
    const operarioAspirado = new OperarioAspirado(2, parametros.tiempoAspiradoAlfombra, this.colas.aspirado);
    const operarioSecado = new OperarioSecado(4, parametros.tiempoSecadoCarroceria, this.colas.secado);
    const operarioMontado = new OperarioMontado(5, parametros.tiempoMontado, this.colas.montado);

    this.operarios = {
      desmontado: operarioDesmontado,
      aspirado: operarioAspirado,
      lavado: [
        new OperarioLavado(3.1, parametros.tiempoLavadoCarroceria, this.colas.lavado, [operarioSecado]),
        new OperarioLavado(3.2, parametros.tiempoLavadoCarroceria, this.colas.lavado, [operarioSecado]),
      ],
      secado: operarioSecado,
      montado: operarioMontado,
    };

    this.estadisticos = {
      totalAutosProcesados: 0,
      tiempoPromedioEnSistema: 0,

      esperasColaDesmontado: 0,
      maximaColaDesmontado: 0,
      esperasColaAspirado: 0,
      maximaColaAspirado: 0,
      esperasColaLavado: 0,
      maximaColaLavado: 0,
      esperasColaSecado: 0,
      maximaColaSecado: 0,
      esperasColaMontado: 0,
      maximaColaMontado: 0,
    };
  }

  getProximosEventos(): IProximoEvento[] {
    const {
      proximaLlegadaAuto,
      proximoIdAuto,
      operarios: {
        desmontado: operarioDesmontado,
        aspirado: operarioAspirado,
        lavado: operariosLavado,
        secado: operarioSecado,
        montado: operarioMontado,
      },
    } = this;

    const eventos = [];

    if (proximaLlegadaAuto) {
      eventos.unshift({
        evento: Evento.LlegadaAuto,
        reloj: proximaLlegadaAuto,
        id: proximoIdAuto,
      });
    }

    if (operarioDesmontado.estado === EstadoOperario.Ocupado) {
      eventos.unshift({
        evento: Evento.FinDesmontado,
        reloj: operarioDesmontado.auto?.finDesmontado as number,
        emisor: operarioDesmontado,
      });
    }

    if (operarioAspirado.estado === EstadoOperario.Ocupado) {
      eventos.unshift({
        evento: Evento.FinAspirado,
        reloj: operarioAspirado.auto?.alfombra.finAspirado as number,
        emisor: operarioAspirado,
      });
    }

    const operarioLavado = _.chain(operariosLavado)
      .filter(({ estado }) => estado === EstadoOperario.Ocupado)
      .minBy(({ auto }) => auto?.carroceria.finLavado)
      .value();

    if (operarioLavado) {
      eventos.unshift({
        evento: Evento.FinLavado,
        reloj: operarioLavado.auto?.carroceria.finLavado as number,
        emisor: operarioLavado,
      });
    }

    if (operarioSecado.estado === EstadoOperario.Ocupado) {
      eventos.unshift({
        evento: Evento.FinSecado,
        reloj: operarioSecado.auto?.carroceria.finSecado as number,
        emisor: operarioSecado,
      });
    }

    if (operarioMontado.estado === EstadoOperario.Ocupado) {
      eventos.unshift({
        evento: Evento.FinMontado,
        reloj: operarioMontado.auto?.finMontado as number,
        emisor: operarioMontado,
      });
    }

    return eventos;
  }

  getProbabilidadEsperarDesmontado(cantidadTotal: number) {
    return this.estadisticos.esperasColaDesmontado / cantidadTotal;
  }

  acumularEsperasColaDesmontado(esperas = 1) {
    this.estadisticos.esperasColaDesmontado += esperas;
    this.estadisticos.maximaColaDesmontado = Math.max(
      this.estadisticos.maximaColaDesmontado,
      this.colas.desmontado.length,
    );
  }

  getProbabilidadEsperarAspirado(cantidadTotal: number) {
    return this.estadisticos.esperasColaAspirado / cantidadTotal;
  }

  acumularEsperasColaAspirado(esperas = 1) {
    this.estadisticos.esperasColaAspirado += esperas;
    this.estadisticos.maximaColaAspirado = Math.max(
      this.estadisticos.maximaColaAspirado,
      this.colas.aspirado.length,
    );
  }

  getProbabilidadEsperarLavado(cantidadTotal: number) {
    return this.estadisticos.esperasColaLavado / cantidadTotal;
  }

  acumularEsperasColaLavado(esperas = 1) {
    this.estadisticos.esperasColaLavado += esperas;
    this.estadisticos.maximaColaLavado = Math.max(
      this.estadisticos.maximaColaLavado,
      this.colas.lavado.length,
    );
  }

  getProbabilidadEsperarSecado(cantidadTotal: number) {
    return this.estadisticos.esperasColaSecado / cantidadTotal;
  }

  acumularEsperasColaSecado(esperas = 1) {
    this.estadisticos.esperasColaSecado += esperas;
    this.estadisticos.maximaColaSecado = Math.max(
      this.estadisticos.maximaColaSecado,
      this.colas.secado.length,
    );
  }

  getProbabilidadEsperarMontado(cantidadTotal: number) {
    return this.estadisticos.esperasColaMontado / cantidadTotal;
  }

  acumularEsperasColaMontado(esperas = 1) {
    this.estadisticos.esperasColaMontado += esperas;
    this.estadisticos.maximaColaMontado = Math.max(
      this.estadisticos.maximaColaMontado,
      this.colas.montado.length,
    );
  }

  acumularTotalAutosProcesados(autos = 1) {
    this.estadisticos.totalAutosProcesados += autos;
  }

  promediarTiempoEnSistema(tiempoEnSistema: number) {
    this.estadisticos.tiempoPromedioEnSistema = incrementalMean(
      tiempoEnSistema,
      this.estadisticos.totalAutosProcesados,
      this.estadisticos.tiempoPromedioEnSistema,
    );
  }

  getFullStatistics() {
    const {
      operarios: {
        desmontado: operarioDesmontado,
        aspirado: operarioAspirado,
        lavado: operariosLavado,
        secado: operarioSecado,
        montado: operarioMontado,
      },
      estadisticos: {
        totalAutosProcesados,
        tiempoPromedioEnSistema,

        esperasColaDesmontado,
        maximaColaDesmontado,
        esperasColaAspirado,
        maximaColaAspirado,
        esperasColaLavado,
        maximaColaLavado,
        esperasColaSecado,
        maximaColaSecado,
        esperasColaMontado,
        maximaColaMontado,
      },
    } = this;

    return {
      autos: {
        totalProcesados: totalAutosProcesados,
        tiempoPromedioEnSistema,
      },
      operarios: {
        desmontado: {
          tiempoOcupado: operarioDesmontado.tiempoOcupado,
          probabilidadOcupado: operarioDesmontado.getProbabilidadOcupado(this.reloj),
          cola: {
            esperas: esperasColaDesmontado,
            probabilidad: this.getProbabilidadEsperarDesmontado(totalAutosProcesados),
            maximo: maximaColaDesmontado,
          },
        },
        aspirado: {
          tiempoOcupado: operarioAspirado.tiempoOcupado,
          probabilidadOcupado: operarioAspirado.getProbabilidadOcupado(this.reloj),
          cola: {
            esperas: esperasColaAspirado,
            probabilidad: this.getProbabilidadEsperarAspirado(totalAutosProcesados),
            maximo: maximaColaAspirado,
          },
        },
        lavado: {
          tiempoOcupado: (
            operariosLavado[0].tiempoOcupado
            + operariosLavado[1].tiempoOcupado
          ) / 2,
          probabilidadOcupado: (
            operariosLavado[0].getProbabilidadOcupado(this.reloj)
            + operariosLavado[1].getProbabilidadOcupado(this.reloj)
          ) / 2,
          bloqueos: (
            operariosLavado[0].bloqueos
            + operariosLavado[1].bloqueos
          ) / 2,
          probabilidadBloqueado: (
            operariosLavado[0].getProbabilidadBloqueado(totalAutosProcesados / 2)
            + operariosLavado[1].getProbabilidadBloqueado(totalAutosProcesados / 2)
          ) / 2,
          cola: {
            esperas: esperasColaLavado,
            probabilidad: this.getProbabilidadEsperarLavado(totalAutosProcesados),
            maximo: maximaColaLavado,
          },
        },
        secado: {
          tiempoOcupado: operarioSecado.tiempoOcupado,
          probabilidadOcupado: operarioSecado.getProbabilidadOcupado(this.reloj),
          cola: {
            esperas: esperasColaSecado,
            probabilidad: this.getProbabilidadEsperarSecado(totalAutosProcesados),
            maximo: maximaColaSecado,
          },
        },
        montado: {
          tiempoOcupado: operarioMontado.tiempoOcupado,
          probabilidadOcupado: operarioMontado.getProbabilidadOcupado(this.reloj),
          cola: {
            esperas: esperasColaMontado,
            probabilidad: this.getProbabilidadEsperarMontado(totalAutosProcesados),
            maximo: maximaColaMontado,
          },
        },
      },
    };
  }

  toSerializable(): ISerializableVectorEstado {
    return {
      iteracion: this.iteracion,
      reloj: this.reloj,
      evento: this.evento,
      emisor: this.emisor.toSerializable(),

      operarios: {
        desmontado: this.operarios.desmontado.toSerializable(),
        aspirado: this.operarios.aspirado.toSerializable(),
        lavado: [
          this.operarios.lavado[0].toSerializable(),
          this.operarios.lavado[1].toSerializable(),
        ],
        secado: this.operarios.secado.toSerializable(),
        montado: this.operarios.montado.toSerializable(),
      },

      colas: {
        desmontado: {
          tamaño: this.colas.desmontado.length,
          orden: this.colas.desmontado.map(({ id }) => id).join(', '),
        },
        aspirado: {
          tamaño: this.colas.aspirado.length,
          orden: this.colas.aspirado.map(({ id }) => id).join(', '),
        },
        lavado: {
          tamaño: this.colas.lavado.length,
          orden: this.colas.lavado.map(({ id }) => id).join(', '),
        },
        secado: {
          tamaño: this.colas.secado.length,
          orden: this.colas.secado.map(({ id }) => id).join(', '),
        },
        montado: {
          tamaño: this.colas.montado.length,
          orden: this.colas.montado.map(({ id }) => id).join(', '),
        },
      },

      proximaLlegadaAuto: this.proximaLlegadaAuto,

      estadisticos: {
        ...this.estadisticos,
      },
    };
  }
}
