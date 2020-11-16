export interface ISerializableSistema {
  inicioSimulacion?: number
  tiempoSimulacion?: number
  finSimulacion?: number

  descripcion: string
}

export class Sistema {
  inicioSimulacion?: number;
  tiempoSimulacion?: number;
  finSimulacion?: number;

  iniciarSimulacion() {
    this.inicioSimulacion = Date.now();
  }

  finalizarSimulacion() {
    this.finSimulacion = Date.now();
    this.tiempoSimulacion = this.finSimulacion - (this.inicioSimulacion as number);
  }

  // eslint-disable-next-line class-methods-use-this
  getDescripcion() {
    return 'Sistema';
  }

  toSerializable(): ISerializableSistema {
    return {
      inicioSimulacion: this.inicioSimulacion,
      tiempoSimulacion: this.tiempoSimulacion,
      finSimulacion: this.finSimulacion,

      descripcion: this.getDescripcion(),
    };
  }
}
