<template>
  <q-page padding>
    <q-form novalidate @submit.prevent="onSubmit">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-5">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Configuración
              </span>
              <q-icon name="fas fa-cog" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section>
              <q-input
                v-model.number="iteraciones"
                label="Número de iteraciones"
                type="number"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-5">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Muestreo
              </span>
              <q-icon name="fas fa-eye-dropper" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section>
              <q-input
                v-model="condicionMuestreo"
                label="Condición"
                type="textarea"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.js()]"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-2 row justify-end">
          <q-btn label="Simular" type="submit" color="primary" class="full-width" />
        </div>
      </div>
    </q-form>

    <q-table
      title="Pizzería"
      class="q-mt-md"
      flat dense bordered
      row-key="id"
      :columns="columnas"
      :visible-columns="columnasVisibles"
      :data="replica"
      :loading="loading"
      :pagination="{
        sortBy: 'id',
        rowsPerPage: 50,
      }"
    >
      <template #top="props">
        <div class="q-table__title">
          Pizzería
        </div>
        <q-space />
        <q-btn
          class="q-mr-md text-primary"
          flat round dense
          icon="fas fa-angle-left"
          :disable="!replicas || !replicas.length"
          @click="onPrev"
        />
        <q-btn
          class="q-mr-md text-primary"
          flat round dense
          icon="fas fa-angle-right"
          :disable="!replicas || !replicas.length"
          @click="onNext"
        />
        <q-select
          v-model="columnasVisibles"
          class="col-2"
          label="Columnas"
          :options="columnas"
          :option-disable="({ required }) => required"
          :display-value="columnasVisibles.length"
          option-value="name"
          borderless
          multiple
          dense
          options-dense
          emit-value
          map-options
        >
          <template #prepend>
            <q-icon name="fas fa-columns" class="text-primary" left />
          </template>
        </q-select>
        <q-btn
          class="q-ml-md text-primary"
          flat round dense
          :icon="props.inFullscreen ? 'fas fa-compress' : 'fas fa-expand'"
          @click="props.toggleFullscreen"
        />
      </template>

      <template #loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template #no-data>
        <div class="row flex-center full-width" style="height: 3rem">
          <q-icon size="2em" name="fas fa-kiwi-bird" />
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<style lang="scss" scoped>
  .q-card .q-card__section .q-icon {
    font-size: 1.25rem;
  }

  /deep/ .q-table {
    thead tr:first-child th:first-child,
    thead tr:first-child th:nth-child(2) {
      color: white;
      background-color: $primary;
    }

    td:first-child,
    td:nth-child(2) {
      background-color: #f5f5f5;
    }

    th:first-child,
    td:first-child,
    th:nth-child(2),
    td:nth-child(2) {
      position: sticky;
      left: 0;
      min-width: 3.5rem;
      z-index: 1;
    }
  }
</style>

<script lang="ts">
  /* eslint-disable max-classes-per-file */

  import {
    defineComponent,
    reactive,
    computed,
    toRefs,
    toRaw,
    PropType,
  } from '@vue/composition-api';

  import _ from 'lodash';
  import { jStat } from 'jstat';

  import * as v from 'helpers/validation';
  import { incrementalMean, incrementalStd } from 'helpers/statistics';

  import { IParameters } from 'components/Parameters.vue';
  import { IResults, IRunResults } from 'components/Results.vue';

  enum Evento {
    InicioSimulacion = 'Inicio Simulación',
    FinSimulacion = 'Fin Simulación',

    InicioTurno = 'Inicio Turno',
    FinTurnoParcial = 'Fin Turno Parcial',
    FinTurno = 'Fin Turno',

    LlegadaPedido = 'Llegada Pedido',
    AbandonoPedido = 'Abandono Pedido',
    FinPreparacionPedido = 'Fin Preparación Pedido',
    FinEntregaPedido = 'Fin Entrega Pedido',
  }

  class Sistema {
    tipo = 'Sistema';

    getNombre() {
      return `${_.startCase(this.tipo)}`;
    }
  }

  enum TipoTurno {
    Mañana = 'Mañana',
    Noche = 'Noche',
  }

  class Turno extends Sistema {
    readonly tipo: TipoTurno;
    readonly inicioTurno: number;
    readonly finTurno: number;
    sobretiempo?: number;

    tiempoEntreLlegadas: {
      cantidad: number;
      promedio: number;
      desviacion: number;
    }

    ordenCocineros: number[];

    constructor(tipo: TipoTurno, inicioTurno: number, finTurno: number) {
      super();
      this.tipo = tipo;
      this.inicioTurno = inicioTurno;
      this.finTurno = finTurno;

      this.tiempoEntreLlegadas = {
        cantidad: 0,
        promedio: 0,
        desviacion: 0,
      };

      this.ordenCocineros = [];
    }

    getNombre() {
      return `Turno (${_.startCase(this.tipo)})`;
    }

    updateTiempoEntreLlegadas(tiempoEntreLlegadas: number) {
      const {
        cantidad: cantidadAnterior,
        promedio: promedioAnterior,
        desviacion: desviacionAnterior,
      } = this.tiempoEntreLlegadas;

      const cantidadActual = cantidadAnterior + 1;
      const promedioActual = incrementalMean(
        tiempoEntreLlegadas, cantidadActual, promedioAnterior,
      );
      const desviacionActual = incrementalStd(
        tiempoEntreLlegadas, cantidadActual, promedioAnterior, promedioActual, desviacionAnterior,
      );

      this.tiempoEntreLlegadas.cantidad = cantidadActual;
      this.tiempoEntreLlegadas.promedio = promedioActual;
      this.tiempoEntreLlegadas.desviacion = desviacionActual;
    }

    getSobretiempo(reloj: number) {
      return this.sobretiempo ?? _.clamp(reloj - this.finTurno, 0, Infinity);
    }

    finalizarTurno(reloj: number) {
      this.sobretiempo = this.getSobretiempo(reloj);
    }
  }

  class Cliente {
    readonly id: number;

    constructor(id: number) {
      this.id = id;
    }
  }

  enum EstadoPedido {
    EsperandoPreparacion = 'Esperando Preparación',
    SiendoPreparado = 'Siendo Preparado',
    EsperandoEntrega = 'Esperando Entrega',
    SiendoEntregado = 'Siendo Entregado',

    Almacenado = 'Almacenado',
    Abandonado = 'Abandonado',
    Entregado = 'Entregado',
    Reutilizado = 'Reutilizado',
  }

  enum TipoPedido {
    Sandwiches = 'Sandwiches',
    Pizzas = 'Pizzas',
    Empanadas = 'Empanadas',
    Hamburgesas = 'Hamburgesas',
    Lomitos = 'Lomitos',
  }

  class Pedido extends Cliente {
    readonly tipo: TipoPedido;
    readonly cantidad: number;
    readonly precioVenta: number;
    readonly tiempoLlegada: number;
    readonly tiempoAbandono: number;
    readonly tiempoCobro: number;

    estado: EstadoPedido;

    inicioPreparacion?: number;
    tiempoPreparacion?: number;
    finPreparacion?: number;

    inicioEntrega?: number;
    tiempoEntrega?: number;
    ingresoVenta?: number;
    finEntrega?: number;

    constructor(
      id: number, tipo: TipoPedido, cantidad: number, precioVenta: number,
      tiempoLlegada: number, tiempoAbandono: number, tiempoCobro: number,
    ) {
      super(id);
      this.tipo = tipo;
      this.cantidad = cantidad;
      this.precioVenta = precioVenta;
      this.tiempoLlegada = tiempoLlegada;
      this.tiempoAbandono = tiempoLlegada + tiempoAbandono;
      this.tiempoCobro = tiempoLlegada + tiempoCobro;

      this.estado = EstadoPedido.EsperandoPreparacion;
    }

    getNombre() {
      return `${this.cantidad} x ${_.startCase(this.tipo)} (${this.id})`;
    }

    iniciarPreparacion(reloj: number, tiempoPreparacion: number) {
      this.estado = EstadoPedido.SiendoPreparado;
      this.inicioPreparacion = reloj;
      this.tiempoPreparacion = tiempoPreparacion;
      this.finPreparacion = reloj + tiempoPreparacion;
    }

    finalizarPreparacion(reloj: number) {
      this.estado = (reloj >= this.tiempoAbandono) ? EstadoPedido.Almacenado : EstadoPedido.EsperandoEntrega;
    }

    iniciarEntrega(reloj: number, tiempoEntrega: number) {
      this.estado = EstadoPedido.SiendoEntregado;
      this.inicioEntrega = reloj;
      this.tiempoEntrega = tiempoEntrega;
      this.finEntrega = reloj + tiempoEntrega;
    }

    finalizarEntrega(reloj: number) {
      if (reloj >= this.tiempoAbandono) {
        this.estado = EstadoPedido.Almacenado;
      }
      else {
        this.estado = EstadoPedido.Entregado;
        this.ingresoVenta = (reloj < this.tiempoCobro) ? this.precioVenta : 0;
      }
    }

    reutilizar(reloj: number, pedido: Pedido) {
      this.estado = EstadoPedido.Reutilizado;
      pedido.estado = EstadoPedido.EsperandoEntrega;
    }

    abandonar() {
      if (this.estado === EstadoPedido.EsperandoPreparacion) {
        this.estado = EstadoPedido.Abandonado;
      }
      else if (this.estado === EstadoPedido.EsperandoEntrega) {
        this.estado = EstadoPedido.Almacenado;
      }
      // else if (this.estado === EstadoPedido.Almacenado) {
      //   this.estado = EstadoPedido.Almacenado;
      // }
    }
  }

  class ColleccionPedidos extends Array<Pedido> {
    getEsperandoPreparacion = () => this.filter(({ estado }) => estado === EstadoPedido.EsperandoPreparacion);
    getEsperandoEntrega = () => this.filter(({ estado }) => estado === EstadoPedido.EsperandoEntrega);
    getAlmacenado = () => this.filter(({ estado }) => estado === EstadoPedido.Almacenado);
    getAbandonado = () => this.filter(({ estado }) => estado === EstadoPedido.Abandonado);
    getEntregado = () => this.filter(({ estado }) => estado === EstadoPedido.Entregado);

    // @todo calculate on push for perfomance
    getProximoId = () => (_.maxBy(this, 'id')?.id || 0) + 1;

    // @todo calculate on push for perfomance
    getProximoPedidoAPreparar = () => this.find(({ estado }) => estado === EstadoPedido.EsperandoPreparacion);

    // @todo calculate on push for perfomance
    getProximosPedidosAEntregar = (cantidad: number) => (
      this
        .filter(({ estado }) => estado === EstadoPedido.EsperandoEntrega)
        .slice(0, cantidad)
    )

    // @todo calculate on push for perfomance
    getProximoAbandonoPedido = (reloj: number) => _.minBy(
      this.filter(
        ({ estado, tiempoAbandono }) => ((
          estado === EstadoPedido.EsperandoPreparacion || estado === EstadoPedido.EsperandoEntrega
          // || estado === EstadoPedido.Almacenado
        ) && (
          tiempoAbandono >= reloj
        )),
      ),
      'tiempoAbandono',
    );

    getPedidoAlmacenado = (tipoPedido: TipoPedido, cantidadPedido: number) => (
      this.find(({ estado, tipo, cantidad }) => (
        estado === EstadoPedido.Almacenado
        && tipo === tipoPedido
        && cantidad === cantidadPedido
      ))
    )

    groupAlmacenado = () => _.groupBy(
      this.getAlmacenado(), 'tipo',
    )
  }

  enum EstadoEmpleado {
    Libre = 'Libre',
    Ocupado = 'Ocupado',
    NoDisponible = 'No Disponible',
  }

  class Servidor {
    id: number;

    constructor(id: number) {
      this.id = id;
    }
  }

  enum TipoEmpleado {
    Cocinero = 'Cocinero',
    Repartidor = 'Repartidor',
  }

  class Empleado extends Servidor {
    tipo: TipoEmpleado;
    estado: EstadoEmpleado;

    tiempoLibre: number;
    inicioTiempoLibre?: number;

    turno: Turno;
    tiempoExtra: number;

    pedidoPreparacion?: Pedido;
    inicioPreparacionPedido?: number;
    finPreparacionPedido?: number;

    pedidosEntrega?: Pedido[];
    inicioEntregaPedidos?: number;
    finEntregaPedidos?: number;
    ingresoUltimaEntrega?: number;

    constructor(id: number, tipo: TipoEmpleado, turno: Turno) {
      super(id);
      this.tipo = tipo;
      this.estado = EstadoEmpleado.Libre;
      this.tiempoLibre = 0;
      this.inicioTiempoLibre = 0;
      this.turno = turno;
      this.tiempoExtra = 0;
    }

    getNombre() {
      return `${_.startCase(this.tipo)} (${this.id})`;
    }

    iniciarPreparacion(reloj: number, tiempoPreparacion: number, pedido: Pedido) {
      if (this.estado === EstadoEmpleado.Libre && this.inicioTiempoLibre !== undefined) {
        this.tiempoLibre += reloj - this.inicioTiempoLibre;
        this.inicioTiempoLibre = undefined;
      }

      this.estado = EstadoEmpleado.Ocupado;
      this.pedidoPreparacion = pedido;
      this.inicioPreparacionPedido = reloj;
      this.finPreparacionPedido = reloj + tiempoPreparacion;
      pedido.iniciarPreparacion(reloj, tiempoPreparacion);
    }

    finalizarPreparacion(reloj: number, tiempoPreparacion?: number, pedido?: Pedido) {
      this.pedidoPreparacion?.finalizarPreparacion(reloj);

      if (typeof tiempoPreparacion === 'number' && pedido) {
        this.iniciarPreparacion(reloj, tiempoPreparacion, pedido);
      }
      else if (reloj > this.turno.finTurno) {
        this.finalizarTurno(reloj);
      }
      else {
        this.estado = EstadoEmpleado.Libre;
        this.inicioTiempoLibre = reloj;
        this.pedidoPreparacion = undefined;
        this.inicioPreparacionPedido = undefined;
        this.finPreparacionPedido = undefined;
      }
    }

    iniciarEntrega(reloj: number, tiempoEntrega: number, pedidos: Pedido[]) {
      this.estado = EstadoEmpleado.Ocupado;
      this.pedidosEntrega = pedidos;
      this.inicioEntregaPedidos = reloj;
      this.finEntregaPedidos = reloj + tiempoEntrega;

      // eslint-disable-next-line no-restricted-syntax
      for (const pedido of pedidos) {
        pedido.iniciarEntrega(reloj, tiempoEntrega);
      }
    }

    finalizarEntrega(reloj: number, tiempoEntrega?: number, pedidos?: Pedido[]) {
      if (this.pedidosEntrega) {
        // eslint-disable-next-line no-restricted-syntax
        for (const pedido of this.pedidosEntrega) {
          pedido.finalizarEntrega(reloj);
        }

        this.ingresoUltimaEntrega = _.sumBy(this.pedidosEntrega, 'ingresoVenta');
      }

      if (typeof tiempoEntrega === 'number' && pedidos?.length) {
        this.iniciarEntrega(reloj, tiempoEntrega, pedidos);
      }
      else {
        this.estado = EstadoEmpleado.Libre;
        this.pedidosEntrega = undefined;
        this.inicioEntregaPedidos = undefined;
        this.finEntregaPedidos = undefined;
      }
    }

    finalizarTurno(reloj: number) {
      if (this.estado === EstadoEmpleado.Libre && this.inicioTiempoLibre !== undefined) {
        this.tiempoLibre += reloj - this.inicioTiempoLibre;
        this.inicioTiempoLibre = undefined;
      }

      if (reloj > this.turno.finTurno) {
        this.tiempoExtra = reloj - this.turno.finTurno;
      }

      this.estado = EstadoEmpleado.NoDisponible;

      this.pedidoPreparacion = undefined;
      this.pedidosEntrega = undefined;
      this.inicioPreparacionPedido = undefined;
      this.inicioEntregaPedidos = undefined;
      this.finPreparacionPedido = undefined;
      this.finEntregaPedidos = undefined;
    }
  }

  class ColleccionEmpleados extends Array<Empleado> {
    getLibres = () => this.filter(({ estado }) => estado === EstadoEmpleado.Libre);

    getCocinerosLibres = () => this.filter(({ tipo, estado }) => (
      tipo === TipoEmpleado.Cocinero && estado === EstadoEmpleado.Libre
    ));

    getRepartidoresLibres = () => this.filter(({ tipo, estado }) => (
      tipo === TipoEmpleado.Repartidor && estado === EstadoEmpleado.Libre
    ));

    getCocineros = () => this.filter(({ tipo }) => tipo === TipoEmpleado.Cocinero);
    getRepartidores = () => this.filter(({ tipo }) => tipo === TipoEmpleado.Repartidor);

    getOcupados = () => this.filter(({ estado }) => estado === EstadoEmpleado.Ocupado);
    getNoDisponibles = () => this.filter(({ estado }) => estado === EstadoEmpleado.NoDisponible);

    // @todo calculate on push for perfomance
    getProximoFinPreparacionPedido = () => _.minBy(
      this.filter(
        ({ tipo, estado }) => (tipo === TipoEmpleado.Cocinero && estado === EstadoEmpleado.Ocupado),
      ),
      'finPreparacionPedido',
    );

    // @todo calculate on push for perfomance
    getProximoFinEntregaPedido = () => _.minBy(
      this.filter(
        ({ tipo, estado }) => (tipo === TipoEmpleado.Repartidor && estado === EstadoEmpleado.Ocupado),
      ),
      'finEntregaPedidos',
    );
  }

  export interface IVectorEstado {
    id: number
    reloj: number
    evento: Evento
    emisor: Sistema | Turno | Pedido | Empleado

    // @todo make required
    turno: Turno | null,
    pedidos: ColleccionPedidos | null,
    empleados: ColleccionEmpleados | null,

    llegadaPedido?: {
      tiempoEntreLlegadas: number
      proximaLlegada: number
    }
  }

  export type TReplica = IVectorEstado[];

  type TSamplingFilter = (n: number) => boolean

  interface IConfiguration {
    runs: number
    filter: TSamplingFilter
  }

  let sistema: Sistema;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function generarInicioSimulacion(parametros: IParameters): IVectorEstado {
    sistema = new Sistema();

    return {
      id: 0,
      reloj: 0,
      evento: Evento.InicioSimulacion,
      emisor: sistema,

      turno: null,
      pedidos: null,
      empleados: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function generarFinSimulacion(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    return {
      id: id + 1,
      reloj,
      evento: Evento.FinSimulacion,
      emisor: sistema,

      ...estadoHeredado,
    };
  }

  function generarInicioTurno(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      pedidos: { demanda },
      turnos: { duracionTurno },
    } = parametros;

    const {
      id, evento,
    } = estado;

    const tipoTurno = (evento === Evento.InicioSimulacion) ? TipoTurno.Mañana : TipoTurno.Noche;
    const turno = new Turno(tipoTurno, 0, duracionTurno);

    const vector: IVectorEstado = {
      id: id + 1,
      reloj: 0,
      evento: Evento.InicioTurno,
      emisor: turno,
      turno,

      pedidos: new ColleccionPedidos(),
      empleados: new ColleccionEmpleados(
        new Empleado(1, TipoEmpleado.Cocinero, turno),
        new Empleado(2, TipoEmpleado.Cocinero, turno),
        new Empleado(3, TipoEmpleado.Cocinero, turno),
        new Empleado(4, TipoEmpleado.Repartidor, turno),
      ),
    };

    const tiempoEntreLlegadas = _.clamp(
      demanda.sample(), 0, Infinity,
    );

    if (tiempoEntreLlegadas < turno.finTurno) {
      vector.llegadaPedido = {
        tiempoEntreLlegadas,
        proximaLlegada: tiempoEntreLlegadas,
      };

      vector.turno?.updateTiempoEntreLlegadas(tiempoEntreLlegadas);
    }

    return vector;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function generarFinTurnoParcial(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    const finTurno = estado.turno?.finTurno ?? 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const empleado of estado.empleados?.getCocinerosLibres() ?? []) {
      empleado.finalizarTurno(finTurno);
    }

    return {
      id: id + 1,
      reloj: finTurno,
      evento: Evento.FinTurnoParcial,
      emisor: estadoHeredado.turno as Turno,

      ...estadoHeredado,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function generarFinTurno(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    const finTurno = estado.turno?.finTurno ?? 0;

    const vector = {
      id: id + 1,
      reloj: (reloj > finTurno) ? reloj : finTurno,
      evento: Evento.FinTurno,
      emisor: estadoHeredado.turno as Turno,

      ...estadoHeredado,
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const empleado of estado.empleados ?? []) {
      empleado.finalizarTurno(vector.reloj);
    }

    return vector;
  }

  function generarLlegadaPedido(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      pedidos: { demanda, tipo, ...parametrosPedidos },
      entregas: { tiempoLimiteEspera, tiempoLimiteCobro },
      envios: { tiempoEnvio, cantidadMaximaPorEnvio },
    } = parametros;

    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    const vector: IVectorEstado = {
      id: id + 1,
      reloj: estado.llegadaPedido?.proximaLlegada as number,
      evento: Evento.LlegadaPedido,
      emisor: sistema,

      ...estadoHeredado,
    };

    const tiempoEntreLlegadas = _.clamp(demanda.sample(), 0, Infinity);
    const proximaLlegada = vector.reloj + tiempoEntreLlegadas;
    const finTurno = estado.turno?.finTurno as number;

    if (proximaLlegada < finTurno) {
      vector.llegadaPedido = {
        tiempoEntreLlegadas,
        proximaLlegada,
      };
      vector.turno?.updateTiempoEntreLlegadas(tiempoEntreLlegadas);
    }
    else {
      vector.llegadaPedido = undefined;
    }

    const idPedido = vector.pedidos?.getProximoId() || 0;
    // eslint-disable-next-line no-underscore-dangle
    const _tipoPedido = tipo.sample() as unknown as string;
    let pedido: Pedido;

    const tiempoLlegada = vector.reloj;

    if (_tipoPedido === 'sandwiches') {
      const tipoPedido = TipoPedido.Sandwiches;
      const parametrosPedido = parametrosPedidos.sandwiches;

      const cantidad = parametrosPedido.cantidadPedido as number;
      const precioVenta = cantidad * parametrosPedido.precioVenta;

      pedido = new Pedido(idPedido, tipoPedido, cantidad, precioVenta, tiempoLlegada, tiempoLimiteEspera, tiempoLimiteCobro);
    }
    else if (_tipoPedido === 'pizzas') {
      const tipoPedido = TipoPedido.Pizzas;
      const parametrosPedido = parametrosPedidos.pizzas;

      const cantidad = parametrosPedido.cantidadPedido as number;
      const precioVenta = cantidad * parametrosPedido.precioVenta;

      pedido = new Pedido(idPedido, tipoPedido, cantidad, precioVenta, tiempoLlegada, tiempoLimiteEspera, tiempoLimiteCobro);
    }
    else if (_tipoPedido === 'empanadas') {
      const tipoPedido = TipoPedido.Empanadas;
      const parametrosPedido = parametrosPedidos.empanadas;

      const cantidad = (parametrosPedido.cantidadPedido as any).sample() || 1;
      const precioVenta = cantidad * parametrosPedido.precioVenta;

      pedido = new Pedido(idPedido, tipoPedido, cantidad, precioVenta, tiempoLlegada, tiempoLimiteEspera, tiempoLimiteCobro);
    }
    else if (_tipoPedido === 'hamburgesas') {
      const tipoPedido = TipoPedido.Hamburgesas;
      const parametrosPedido = parametrosPedidos.hamburgesas;
      const cantidad = parametrosPedido.cantidadPedido as number;
      const precioVenta = cantidad * parametrosPedido.precioVenta;

      pedido = new Pedido(idPedido, tipoPedido, cantidad, precioVenta, tiempoLlegada, tiempoLimiteEspera, tiempoLimiteCobro);
    }
    else {
      const tipoPedido = TipoPedido.Lomitos;
      const parametrosPedido = parametrosPedidos.lomitos;
      const cantidad = parametrosPedido.cantidadPedido as number;
      const precioVenta = cantidad * parametrosPedido.precioVenta;

      pedido = new Pedido(idPedido, tipoPedido, cantidad, precioVenta, tiempoLlegada, tiempoLimiteEspera, tiempoLimiteCobro);
    }

    vector.emisor = pedido;
    vector.pedidos?.push(pedido);

    const pedidoAlmacenado = estado.pedidos?.getPedidoAlmacenado(pedido.tipo, pedido.cantidad);

    if (pedidoAlmacenado) {
      pedidoAlmacenado.reutilizar(vector.reloj, pedido);

      const repartidoresLibres = vector.empleados?.getRepartidoresLibres() as Empleado[];

      if (repartidoresLibres.length) {
        const repartidor = repartidoresLibres[0];

        const tiempoEntrega = _.clamp(
          tiempoEnvio.sample(), 0, Infinity,
        );

        const pedidos = estado.pedidos?.getProximosPedidosAEntregar(cantidadMaximaPorEnvio) as Pedido[];
        repartidor.iniciarEntrega(vector.reloj, tiempoEntrega, pedidos);
      }

      return vector;
    }

    const cocinerosLibres = vector.empleados?.getCocinerosLibres() as Empleado[];

    if (cocinerosLibres.length) {
      // @todo [Math.floor(Math.random() * length))]
      const empleado = _.maxBy(
        cocinerosLibres, (cocinero) => cocinero.tiempoLibre + (vector.reloj - (cocinero.inicioTiempoLibre || 0)),
      ) as Empleado;
      let tiempoPreparacion;

      if (pedido.tipo === TipoPedido.Sandwiches) {
        const parametrosPedido = parametrosPedidos.sandwiches;
        tiempoPreparacion = (parametrosPedido.tiempoPreparacion as any).sample() as number;
      }
      else if (pedido.tipo === TipoPedido.Pizzas) {
        const parametrosPedido = parametrosPedidos.pizzas;
        tiempoPreparacion = (parametrosPedido.tiempoPreparacion as any).sample() as number;
      }
      else if (pedido.tipo === TipoPedido.Empanadas) {
        const { capacidadMaximaFreidora, tiempoPreparacionMedio, tiempoPreparacionCompleto } = parametrosPedidos.empanadas;
        tiempoPreparacion = (pedido.cantidad >= capacidadMaximaFreidora)
          ? (
            tiempoPreparacionCompleto * Math.floor(pedido.cantidad / capacidadMaximaFreidora)
            + tiempoPreparacionMedio * (pedido.cantidad % capacidadMaximaFreidora)
          )
          : tiempoPreparacionMedio;
      }
      else if (pedido.tipo === TipoPedido.Hamburgesas) {
        const parametrosPedido = parametrosPedidos.hamburgesas;
        tiempoPreparacion = parametrosPedido.tiempoPreparacion as number;
      }
      else {
        const parametrosPedido = parametrosPedidos.lomitos;
        tiempoPreparacion = parametrosPedido.tiempoPreparacion as number;
      }

      empleado.iniciarPreparacion(tiempoLlegada, tiempoPreparacion, pedido);
      if (vector.turno) {
        vector.turno.ordenCocineros.push(empleado.id);
      }
    }

    return vector;
  }

  function generarFinPreparacionPedido(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      pedidos: { demanda, tipo, ...parametrosPedidos },
      envios: { tiempoEnvio, cantidadMaximaPorEnvio },
    } = parametros;

    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    const cocinero = estado.empleados?.getProximoFinPreparacionPedido() as Empleado;

    const vector: IVectorEstado = {
      id: id + 1,
      reloj: cocinero.finPreparacionPedido as number,
      evento: Evento.FinPreparacionPedido,
      emisor: cocinero,

      ...estadoHeredado,
    };

    const pedido = estado.pedidos?.getProximoPedidoAPreparar();
    let tiempoPreparacion;

    if (pedido) {
      if (pedido.tipo === TipoPedido.Sandwiches) {
        const parametrosPedido = parametrosPedidos.sandwiches;
        tiempoPreparacion = (parametrosPedido.tiempoPreparacion as any).sample() as number;
      }
      else if (pedido.tipo === TipoPedido.Pizzas) {
        const parametrosPedido = parametrosPedidos.pizzas;
        tiempoPreparacion = (parametrosPedido.tiempoPreparacion as any).sample() as number;
      }
      else if (pedido.tipo === TipoPedido.Empanadas) {
        const { capacidadMaximaFreidora, tiempoPreparacionMedio, tiempoPreparacionCompleto } = parametrosPedidos.empanadas;
        tiempoPreparacion = (pedido.cantidad >= capacidadMaximaFreidora)
          ? (
            tiempoPreparacionCompleto * Math.floor(pedido.cantidad / capacidadMaximaFreidora)
            + tiempoPreparacionMedio * (pedido.cantidad % capacidadMaximaFreidora)
          )
          : tiempoPreparacionMedio;
      }
      else if (pedido.tipo === TipoPedido.Hamburgesas) {
        const parametrosPedido = parametrosPedidos.hamburgesas;
        tiempoPreparacion = parametrosPedido.tiempoPreparacion as number;
      }
      else {
        const parametrosPedido = parametrosPedidos.lomitos;
        tiempoPreparacion = parametrosPedido.tiempoPreparacion as number;
      }

      tiempoPreparacion = _.clamp(
        tiempoPreparacion, 0, Infinity,
      );
    }

    cocinero.finalizarPreparacion(vector.reloj, tiempoPreparacion, pedido);

    if (vector.turno && pedido) {
      vector.turno.ordenCocineros.push(cocinero.id);
    }

    const repartidoresLibres = vector.empleados?.getRepartidoresLibres() as Empleado[];

    if (repartidoresLibres.length) {
      const repartidor = repartidoresLibres[0];

      const tiempoEntrega = _.clamp(
        tiempoEnvio.sample(), 0, Infinity,
      );

      const pedidos = estado.pedidos?.getProximosPedidosAEntregar(cantidadMaximaPorEnvio) as Pedido[];
      repartidor.iniciarEntrega(vector.reloj, tiempoEntrega, pedidos);
    }

    return vector;
  }

  function generarFinEntregaPedido(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    const {
      envios: { tiempoEnvio, cantidadMaximaPorEnvio },
    } = parametros;

    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    const empleado = estado.empleados?.getProximoFinEntregaPedido() as Empleado;

    const vector: IVectorEstado = {
      id: id + 1,
      reloj: empleado.finEntregaPedidos as number,
      evento: Evento.FinEntregaPedido,
      emisor: empleado,

      ...estadoHeredado,
    };

    const pedidos = estado.pedidos?.getProximosPedidosAEntregar(cantidadMaximaPorEnvio);
    let tiempoEntrega;

    if (pedidos?.length) {
      tiempoEntrega = _.clamp(
        tiempoEnvio.sample(), 0, Infinity,
      );
    }

    empleado.finalizarEntrega(vector.reloj, tiempoEntrega, pedidos);

    if (
      !pedidos?.length
      && reloj > (vector.turno?.finTurno ?? 0)
      && !vector.empleados?.getOcupados()?.length
    ) {
      empleado.finalizarTurno(reloj);
    }

    return vector;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function generarAbandonoPedido(estado: IVectorEstado, parametros: IParameters) {
    const {
      id, reloj, evento, emisor, ...estadoHeredado
    } = estado;

    const pedido = estado.pedidos?.getProximoAbandonoPedido(reloj) as Pedido;

    const vector: IVectorEstado = {
      id: id + 1,
      reloj: pedido.tiempoAbandono,
      evento: Evento.AbandonoPedido,
      emisor: pedido,

      ...estadoHeredado,
    };

    pedido.abandonar();

    return vector;
  }

  function executeNext(estado: IVectorEstado, parametros: IParameters): IVectorEstado {
    if (estado.evento === Evento.InicioSimulacion) {
      return generarInicioTurno(estado, parametros);
    }

    if (estado.evento === Evento.FinTurno) {
      if (estado.turno?.tipo === TipoTurno.Mañana) {
        return generarInicioTurno(estado, parametros);
      }

      return generarFinSimulacion(estado, parametros);
    }

    if (!estado.turno || !estado.pedidos || !estado.empleados) {
      throw new Error('Unreachable condition');
    }

    // if (
    //   estado.reloj >= estado.turno.finTurno
    //   && estado.empleados.getLibres.length === 0
    //   && estado.empleados.getOcupados.length === 0
    // ) {
    //   return generarFinTurno(estado, parametros);
    // }

    const proximaLlegadaPedido = estado.llegadaPedido?.proximaLlegada;
    const proximoFinPreparacionPedido = estado.empleados?.getProximoFinPreparacionPedido()?.finPreparacionPedido;
    const proximoFinEntregaPedido = estado.empleados?.getProximoFinEntregaPedido()?.finEntregaPedidos;
    const proximoAbandonoPedido = estado.pedidos?.getProximoAbandonoPedido(estado.reloj)?.tiempoAbandono;

    const tiempoProximoEvento = _.min([
      proximaLlegadaPedido,
      proximoFinPreparacionPedido,
      proximoFinEntregaPedido,
      proximoAbandonoPedido,
    ]);

    if (tiempoProximoEvento === undefined) {
      return generarFinTurno(estado, parametros);
    }

    const proximoFinTurno = estado.turno.finTurno;

    if (tiempoProximoEvento > proximoFinTurno && estado.empleados?.getCocinerosLibres().length) {
      return generarFinTurnoParcial(estado, parametros);
    }

    if (tiempoProximoEvento === proximoAbandonoPedido) {
      return generarAbandonoPedido(estado, parametros);
    }
    else if (tiempoProximoEvento === proximoFinEntregaPedido) {
      return generarFinEntregaPedido(estado, parametros);
    }
    else if (tiempoProximoEvento === proximoFinPreparacionPedido) {
      return generarFinPreparacionPedido(estado, parametros);
    }
    else if (tiempoProximoEvento === proximaLlegadaPedido) {
      return generarLlegadaPedido(estado, parametros);
    }

    return generarFinSimulacion(estado, parametros);
  }

  function calcularResultadosTurno(vector: IVectorEstado): IRunResults {
    const tiempoEntreLlegadas = vector.turno?.tiempoEntreLlegadas as IRunResults['tiempoEntreLlegadas'];

    const cantidadPedidosPorHora = _(vector.pedidos)
      .groupBy(({ tiempoLlegada }: Pedido) => Math.ceil(tiempoLlegada / 60))
      .mapValues('length')
      .values()
      .value();
    const cantidadPedidos = {
      promedio: jStat.mean(cantidadPedidosPorHora),
      desviacion: jStat.stdev(cantidadPedidosPorHora),
    };

    const tipoProductoPedido = _(vector.pedidos)
      .groupBy('tipo')
      .mapValues('length')
      .value();

    const tiemposPreparacionSandwiches = _(
      vector.pedidos?.filter(({ tipo }) => tipo === TipoPedido.Sandwiches),
    )
      .map('tiempoPreparacion')
      .without(undefined)
      .value();
    const tiempoPreparacionSandwich = {
      promedio: jStat.mean(tiemposPreparacionSandwiches),
      desviacion: jStat.stdev(tiemposPreparacionSandwiches),
    };

    const tiemposPreparacionPizzas = _(
      vector.pedidos?.filter(({ tipo }) => tipo === TipoPedido.Pizzas),
    )
      .map('tiempoPreparacion')
      .without(undefined)
      .value();

    const tiempoPreparacionPizza = {
      promedio: jStat.mean(tiemposPreparacionPizzas),
      desviacion: jStat.stdev(tiemposPreparacionPizzas),
    };

    const tiemposPreparacionEmpanadas = _(
      vector.pedidos?.filter(({ tipo }) => tipo === TipoPedido.Empanadas),
    )
      .map('tiempoPreparacion')
      .without(undefined)
      .value();
    const tiempoPreparacionEmpanadas = {
      promedio: jStat.mean(tiemposPreparacionEmpanadas),
      desviacion: jStat.stdev(tiemposPreparacionEmpanadas),
    };

    const cantidadesEmpanadas = _(
      vector.pedidos?.filter(({ tipo }) => tipo === TipoPedido.Empanadas),
    )
      .map('cantidad')
      .value();
    const demandaEmpanadas = {
      promedio: jStat.mean(cantidadesEmpanadas),
      desviacion: jStat.stdev(cantidadesEmpanadas),
    };

    const ingresosHamburguesaLomito = _(
      vector.pedidos?.filter(({
        tipo,
        estado,
      }) => (
        (tipo === TipoPedido.Hamburgesas || tipo === TipoPedido.Lomitos)
        && estado === EstadoPedido.Entregado
      )),
    )
      .map('ingresoVenta')
      .without(undefined)
      .value();
    const ingresoHamburguesaLomito = {
      promedio: jStat.mean(ingresosHamburguesaLomito),
      desviacion: jStat.stdev(ingresosHamburguesaLomito),
    };

    const ordenCocineros = vector.turno?.ordenCocineros || [];

    const tiemposEntrega = _(
      vector.pedidos?.getEntregado(),
    )
      .map('tiempoEntrega')
      .value();
    const tiempoEntrega = {
      promedio: jStat.mean(tiemposEntrega),
      desviacion: jStat.stdev(tiemposEntrega),
    };

    return {
      tiempoEntreLlegadas,
      cantidadPedidos,
      tipoProductoPedido,
      tiempoPreparacionSandwich,
      tiempoPreparacionPizza,
      tiempoPreparacionEmpanadas,
      demandaEmpanadas,
      ingresoHamburguesaLomito,
      ordenCocineros,
      tiempoEntrega,
    };
  }

  function calcularResultados(vectorMañana: IVectorEstado, vectorNoche: IVectorEstado): IResults {
    // eslint-disable-next-line prefer-destructuring
    const tiemposLibreCocineros = [
      ..._.map(vectorMañana.empleados?.getCocineros(), 'tiempoLibre'),
      ..._.map(vectorNoche.empleados?.getCocineros(), 'tiempoLibre'),
    ];

    const tiempoPromedioLibreCocineros = jStat.mean(tiemposLibreCocineros);

    const tiemposLibreRepartidores = [
      ..._.map(vectorMañana.empleados?.getRepartidores(), 'tiempoLibre'),
      ..._.map(vectorNoche.empleados?.getRepartidores(), 'tiempoLibre'),
    ];

    const tiempoPromedioLibreRepartidores = jStat.mean(tiemposLibreRepartidores);

    const pedidosEntregados = [
      ...vectorMañana.pedidos?.getEntregado(),
      ...vectorNoche.pedidos?.getEntregado(),
    ];

    const pedidosAbandonados = [
      ...vectorMañana.pedidos?.getAbandonado(),
      ...vectorNoche.pedidos?.getAbandonado(),
    ];

    const ventasAbandonadas = pedidosAbandonados.length;
    const maxVentasAbandonadas = ventasAbandonadas;

    const pedidosPerdidos = pedidosEntregados.filter(
      ({ ingresoVenta }) => ingresoVenta === 0,
    );

    const pedidosGratis = pedidosPerdidos.length;
    const perdidasVenta = _.sumBy(pedidosPerdidos, 'precioVenta');

    const ingresosVentas = _.map(pedidosEntregados, 'ingresoVenta');

    const ingresosVenta = {
      total: _.sum(ingresosVentas),
      promedio: jStat.mean(ingresosVentas),
      desviacion: jStat.stdev(ingresosVentas),
    };

    const esperasEnColaPreparacion = [
      ...vectorMañana.pedidos || [],
      ...vectorNoche.pedidos || [],
    ].map(
      ({ tiempoLlegada, inicioPreparacion, tiempoAbandono }) => ((inicioPreparacion ?? tiempoAbandono) - tiempoLlegada),
    );

    const esperaPromedioEnColaPreparacion = jStat.mean(esperasEnColaPreparacion);

    const tiemposEnSistema = pedidosEntregados.map(
      ({ tiempoLlegada, finEntrega = tiempoLlegada }) => (finEntrega - tiempoLlegada),
    );

    const tiempoPromedioEnSistema = jStat.mean(tiemposEnSistema);

    const ingresosMenores250 = pedidosEntregados
      .filter(({ ingresoVenta = 0 }) => ingresoVenta <= 250)
      .length;

    const probabilidadIngresoMenor250 = ingresosMenores250 / pedidosEntregados.length;

    const pedidosAbandonadosOGratisMayor5 = (pedidosGratis + ventasAbandonadas) >= 5 ? 1 : 0;

    return {
      tiempoPromedioLibreCocineros,
      tiempoPromedioLibreRepartidores,
      ventasAbandonadas,
      maxVentasAbandonadas,
      pedidosGratis,
      perdidasVenta,
      ingresosVenta,
      esperaPromedioEnColaPreparacion,
      tiempoPromedioEnSistema,
      probabilidadIngresoMenor250,
      pedidosAbandonadosOGratisMayor5,
    };
  }

  function mergeResultados(iteracion: number, resultadosAnteriores: IResults, resultadosActuales: IResults): IResults {
    if (iteracion === 1) {
      return resultadosActuales;
    }

    return {
      tiempoPromedioLibreCocineros: incrementalMean(
        resultadosActuales.tiempoPromedioLibreCocineros,
        iteracion,
        resultadosAnteriores.tiempoPromedioLibreCocineros,
      ),
      tiempoPromedioLibreRepartidores: incrementalMean(
        resultadosActuales.tiempoPromedioLibreRepartidores,
        iteracion,
        resultadosAnteriores.tiempoPromedioLibreRepartidores,
      ),
      ventasAbandonadas: incrementalMean(
        resultadosActuales.ventasAbandonadas,
        iteracion,
        resultadosAnteriores.ventasAbandonadas,
      ),
      maxVentasAbandonadas: Math.max(
        resultadosActuales.ventasAbandonadas,
        resultadosAnteriores.ventasAbandonadas,
      ),
      perdidasVenta: incrementalMean(
        resultadosActuales.perdidasVenta,
        iteracion,
        resultadosAnteriores.perdidasVenta,
      ),
      pedidosGratis: incrementalMean(
        resultadosActuales.pedidosGratis,
        iteracion,
        resultadosAnteriores.pedidosGratis,
      ),
      ingresosVenta: {
        total: incrementalMean(
          resultadosActuales.ingresosVenta.total,
          iteracion,
          resultadosAnteriores.ingresosVenta.total,
        ),
        promedio: incrementalMean(
          resultadosActuales.ingresosVenta.promedio,
          iteracion,
          resultadosAnteriores.ingresosVenta.promedio,
        ),
        desviacion: incrementalMean(
          resultadosActuales.ingresosVenta.desviacion,
          iteracion,
          resultadosAnteriores.ingresosVenta.desviacion,
        ),
      },
      esperaPromedioEnColaPreparacion: incrementalMean(
        resultadosActuales.esperaPromedioEnColaPreparacion,
        iteracion,
        resultadosAnteriores.esperaPromedioEnColaPreparacion,
      ),
      tiempoPromedioEnSistema: incrementalMean(
        resultadosActuales.tiempoPromedioEnSistema,
        iteracion,
        resultadosAnteriores.tiempoPromedioEnSistema,
      ),
      probabilidadIngresoMenor250: incrementalMean(
        resultadosActuales.probabilidadIngresoMenor250,
        iteracion,
        resultadosAnteriores.probabilidadIngresoMenor250,
      ),
      pedidosAbandonadosOGratisMayor5: incrementalMean(
        resultadosActuales.pedidosAbandonadosOGratisMayor5,
        iteracion,
        resultadosAnteriores.pedidosAbandonadosOGratisMayor5,
      ),
    };
  }

  function executeRun(
    parametros: IParameters,
    capturarVectoresEstado: boolean,
  ): TReplica {
    const vectores: IVectorEstado[] = [];
    let estado: IVectorEstado = generarInicioSimulacion(parametros);

    if (capturarVectoresEstado) {
      vectores.push(_.cloneDeep(estado));
    }

    do {
      estado = executeNext(estado, parametros);

      if (capturarVectoresEstado || estado.evento === Evento.InicioTurno || estado.evento === Evento.FinTurno) {
        vectores.push(_.cloneDeep(estado));
      }
    } while (estado.evento !== Evento.FinSimulacion);

    return vectores;
  }

  function executeSimulation(
    parametros: IParameters,
    configuracion: IConfiguration,
  ) {
    const {
      runs,
      filter,
    } = configuracion;

    const replicas: TReplica[] = [];
    const resultadosTurno: {
      mañana: IRunResults,
      noche: IRunResults,
    }[] = [];

    let r = 0;

    let resultadosSimulación: IResults = {} as IResults;

    while (r < runs) {
      const guardarReplica = filter(r);

      const replica = executeRun(toRaw(parametros), guardarReplica);

      const [vectorFinTurnoMañana, vectorFinTurnoNoche] = replica.filter(({ evento }) => evento === Evento.FinTurno);

      const resultadosReplica = calcularResultados(vectorFinTurnoMañana, vectorFinTurnoNoche);

      resultadosSimulación = mergeResultados(
        r + 1, resultadosSimulación, resultadosReplica,
      );

      if (guardarReplica) {
        const resultadosTurnoMañana = calcularResultadosTurno(vectorFinTurnoMañana);
        const resultadosTurnoNoche = calcularResultadosTurno(vectorFinTurnoNoche);

        resultadosTurno.push({
          mañana: resultadosTurnoMañana,
          noche: resultadosTurnoNoche,
        });
        replicas.push(replica);
      }

      r++;
    }

    return {
      replicas,
      resultadosReplicas: resultadosTurno,
      resultados: resultadosSimulación,
    };
  }

  // @todo move to format helper
  const nn = (value: number) => Number(
    value.toFixed(0),
  );

  const n2 = (value: number) => (
    typeof value === 'number'
      ? Number(value.toFixed(2))
      : value
  );

  const n3 = (value: number) => Number(
    value.toFixed(3),
  );

  const np = (value: number) => (
    (value % 1) ? `${Math.floor(value)}+` : value
  );

  const $ = (value: number) => (
    typeof value === 'number' ? `$ ${value.toFixed(0)}` : value
  );

  const percent = (value: number) => `${
    Number(
      (value * 100).toFixed(0),
    )
  } %`;

  function useSimulation(props: { parameters: IParameters }, emit: any) {
    const state: any = reactive({
      iteraciones: 1000000,
      condicionMuestreo: '!(n % 1000)',

      columnas: [
        {
          name: 'reloj',
          label: 'Reloj',
          field: (row: IVectorEstado) => row.reloj,
          align: 'right',
          required: true,
          format: n2,
        },
        {
          name: 'evento',
          label: 'Evento',
          field: (row: IVectorEstado) => row.evento,
          align: 'left',
          required: true,
        },
        {
          name: 'emisor',
          label: 'Emisor',
          field: (row: IVectorEstado) => row.emisor.getNombre(),
          align: 'left',
          required: true,
        },
        {
          name: 'tiempo-entre-llegadas',
          label: 'Tiempo entre llegadas',
          field: (row: IVectorEstado) => row.llegadaPedido?.tiempoEntreLlegadas,
          align: 'right',
        },
        {
          name: 'proxima-llegada',
          label: 'Proxima llegada',
          field: (row: IVectorEstado) => row.llegadaPedido?.proximaLlegada,
          align: 'right',
          required: true,
        },
        {
          name: 'en-cola-para-preparar',
          label: 'En cola para preparar',
          field: (row: IVectorEstado) => {
            const pedidos = row.pedidos?.getEsperandoPreparacion();
            if (!pedidos?.length) {
              return undefined;
            }

            return `[${
              pedidos.map(({ id }) => id).join(', ')
            }] (${
              pedidos.length
            })`;
          },
          align: 'right',
        },
        {
          name: 'en-cola-para-entrega',
          label: 'En cola para entrega',
          field: (row: IVectorEstado) => {
            const pedidos = row.pedidos?.getEsperandoEntrega();
            if (!pedidos?.length) {
              return undefined;
            }

            return `[${
              pedidos.map(({ id }) => id).join(', ')
            }] (${
              pedidos.length
            })`;
          },
          align: 'right',
        },
        {
          name: 'cocinero-1--estado',
          label: 'C1 | Estado',
          field: (row: IVectorEstado) => row.empleados && row.empleados[0]?.estado,
          align: 'left',
          required: true,
        },
        {
          name: 'cocinero-1--pedido',
          label: 'C1 | № Pedido',
          field: (row: IVectorEstado) => row.empleados && row.empleados[0]?.pedidoPreparacion?.id,
          align: 'right',
          required: true,
        },
        {
          name: 'cocinero-1--pedido-tiempo-preparacion',
          label: 'C1 | Tiempo preparación',
          field: (row: IVectorEstado) => row.empleados && row.empleados[0]?.pedidoPreparacion?.tiempoPreparacion,
          align: 'right',
          format: n2,
        },
        {
          name: 'cocinero-1--fin-preparacion',
          label: 'C1 | Fin Preparación',
          field: (row: IVectorEstado) => row.empleados && row.empleados[0]?.finPreparacionPedido,
          align: 'right',
          required: true,
          format: n2,
        },
        // {
        //   name: 'cocinero-1--tiempo-libre',
        //   label: 'C1 | Tiempo Libre',
        //   field: (row: IVectorEstado) => row.empleados && row.empleados[0]?.tiempoLibre,
        //   align: 'right',
        //   format: n2,
        // },
        {
          name: 'cocinero-2--estado',
          label: 'C2 | Estado',
          field: (row: IVectorEstado) => row.empleados && row.empleados[1]?.estado,
          align: 'left',
          required: true,
        },
        {
          name: 'cocinero-2--pedido',
          label: 'C2 | № Pedido',
          field: (row: IVectorEstado) => row.empleados && row.empleados[1]?.pedidoPreparacion?.id,
          align: 'right',
          required: true,
        },
        {
          name: 'cocinero-2--pedido-tiempo-preparacion',
          label: 'C2 | Tiempo preparación',
          field: (row: IVectorEstado) => row.empleados && row.empleados[1]?.pedidoPreparacion?.tiempoPreparacion,
          align: 'right',
          format: n2,
        },
        {
          name: 'cocinero-2--fin-preparacion',
          label: 'C2 | Fin Preparación',
          field: (row: IVectorEstado) => row.empleados && row.empleados[1]?.finPreparacionPedido,
          align: 'right',
          required: true,
          format: n2,
        },
        {
          name: 'cocinero-3--estado',
          label: 'C3 | Estado',
          field: (row: IVectorEstado) => row.empleados && row.empleados[2]?.estado,
          align: 'left',
          required: true,
        },
        {
          name: 'cocinero-3--pedido',
          label: 'C3 | № Pedido',
          field: (row: IVectorEstado) => row.empleados && row.empleados[2]?.pedidoPreparacion?.id,
          align: 'right',
          required: true,
        },
        {
          name: 'cocinero-3--pedido-tiempo-preparacion',
          label: 'C3 | Tiempo preparación',
          field: (row: IVectorEstado) => row.empleados && row.empleados[2]?.pedidoPreparacion?.tiempoPreparacion,
          align: 'right',
          format: n2,
        },
        {
          name: 'cocinero-3--fin-preparacion',
          label: 'C3 | Fin Preparación',
          field: (row: IVectorEstado) => row.empleados && row.empleados[2]?.finPreparacionPedido,
          align: 'right',
          required: true,
          format: n2,
        },
        {
          name: 'repartidor--estado',
          label: 'R | Estado',
          field: (row: IVectorEstado) => row.empleados && row.empleados[3]?.estado,
          align: 'left',
          required: true,
        },
        {
          name: 'repartidor--pedidos',
          label: 'R | № Pedidos',
          field: (row: IVectorEstado) => row.empleados && row.empleados[3]?.pedidosEntrega?.map(({ id }) => id).join(', '),
          align: 'left',
          required: true,
        },
        // {
        //   name: 'repartidor--pedido-tiempo-entrega',
        //   label: 'R | Tiempo entrega',
        //   field: (row: IVectorEstado) => {
        //     if (
        //       row.emisor instanceof Empleado
        //       && row.evento === Evento.FinPreparacionPedido
        //       && row.evento === Evento.FinEntregaPedido
        //     ) {
        //     }
        //   },
        //   align: 'right',
        //   format: n2,
        // },
        {
          name: 'repartidor--fin-entrega',
          label: 'R | Fin entrega',
          field: (row: IVectorEstado) => row.empleados && row.empleados[3]?.finEntregaPedidos,
          align: 'right',
          required: true,
          format: n2,
        },
        {
          name: 'ingreso-venta',
          label: 'R | Ingreso Venta',
          // eslint-disable-next-line consistent-return
          field: (row: IVectorEstado) => {
            if (row.emisor instanceof Empleado && row.evento === Evento.FinEntregaPedido) {
              return row.emisor.ingresoUltimaEntrega;
            }
          },
          align: 'right',
          required: true,
          format: $,
        },
        {
          name: 'almacen',
          label: 'Almacén',
          field: (row: IVectorEstado) => _
            .toPairs(row.pedidos?.groupAlmacenado())
            .map(([tipo, pedidos]) => `${tipo}: ${pedidos.length}`)
            .join(' | '),
          align: 'right',
          required: true,
        },
      ],
      columnasVisibles: [
        'reloj', 'evento',
      ],

      resultadosReplicas: [],
      replicas: [] as TReplica[],
      replica: computed(
        () => (state.replicas.length ? state.replicas[state.r] : [] as TReplica),
      ),
      r: 0,
      loading: false,

      onSubmit: () => {
        const configuration = {
          runs: Math.ceil(state.iteraciones / 250),
          // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
          filter: new Function(
            'n', `return Boolean(${state.condicionMuestreo});`,
          ) as TSamplingFilter,
        };

        state.replicas = [];
        state.loading = true;

        const { replicas, resultadosReplicas, resultados } = executeSimulation(props.parameters, configuration);

        emit('finishRun', resultadosReplicas[0]);
        emit('finish', resultados);

        state.loading = false;
        state.r = 0;
        state.replicas = replicas;
        state.resultadosReplicas = resultadosReplicas;
      },

      onPrev: () => {
        state.r = (state.r - 1) % state.replicas.length;
        emit('finishRun', state.resultadosReplicas[state.r]);
      },

      onNext: () => {
        state.r = (state.r + 1) % state.replicas.length;
        emit('finishRun', state.resultadosReplicas[state.r]);
      },
    });

    return toRefs(state);
  }

  export default defineComponent({
    name: 'Simulation',
    components: {},
    props: {
      parameters: {
        required: true,
        type: Object as PropType<IParameters>,
      },
    },
    setup(props, { emit }) {
      return {
        v,
        ...useSimulation(props, emit),
      };
    },
  });
</script>
