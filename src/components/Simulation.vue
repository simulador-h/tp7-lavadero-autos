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
      :data="vectores"
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
    toRefs,
    PropType,
  } from '@vue/composition-api';

  import _ from 'lodash';

  import * as v from 'helpers/validation';
  import { round, $, percent, fallback } from 'helpers/format';
  import { veil } from 'helpers/reactivity';
  import { incrementalMean, incrementalStd } from 'helpers/statistics';

  import { IParameters } from 'components/Parameters.vue';
  import { IResults } from 'components/Results.vue';

  import {
    VectorEstado,
    Evento,
    IProximoEvento,
    ISerializableVectorEstado,
  } from 'models/VectorEstado';

  import {
    Auto,
    EstadoAuto,
  } from 'models/Auto';

  import {
    Operario,
    OperarioDesmontado,
    OperarioAspirado,
    OperarioLavado,
    OperarioSecado,
    OperarioMontado,
    EstadoOperario,
  } from 'models/Operario';

  type TSamplingEvaluator = (n: number) => boolean

  function ejecutarInicioSimulacion(parametros: IParameters): VectorEstado {
    const vector = new VectorEstado(parametros);

    vector.sistema.iniciarSimulacion();
    return vector;
  }

  function ejecutarFinSimulacion(vector: VectorEstado): VectorEstado {
    vector.evento = Evento.FinSimulacion;
    vector.emisor = vector.sistema;

    vector.sistema.finalizarSimulacion();
    return vector;
  }

  function ejecutarLlegadaAuto(vector: VectorEstado, { reloj, evento, id }: IProximoEvento): VectorEstado {
    vector.reloj = reloj;
    vector.evento = evento;

    // Generar nuevo auto
    const auto = new Auto(id as number, reloj);
    vector.emisor = auto;

    // Generar próxima llegada
    vector.proximoIdAuto += 1;
    vector.proximaLlegadaAuto = reloj + vector.tiempoEntreLlegadas.sample();

    // Iniciar desmontado si el operario está libre, agregar a la cola si está ocupado
    const opDesmontado = vector.operarios.desmontado;

    if (opDesmontado.estado === EstadoOperario.Libre) {
      opDesmontado.iniciarDesmontado(reloj, auto);
    }
    else {
      vector.colas.desmontado.push(auto);
      vector.acumularEsperasColaDesmontado();
    }

    return vector;
  }

  function ejecutarFinDesmontado(vector: VectorEstado, { reloj, evento, emisor }: IProximoEvento): VectorEstado {
    vector.reloj = reloj;
    vector.evento = evento;
    vector.emisor = emisor as Operario;

    // Finalizar desmontado
    const opDesmontado = vector.emisor as OperarioDesmontado;
    const auto = opDesmontado.finalizarDesmontado(reloj);

    // Iniciar aspirado si el operario está libre, agregar a la cola si está ocupado
    const opAspirado = vector.operarios.aspirado;

    if (opAspirado.estado === EstadoOperario.Libre) {
      opAspirado.iniciarAspirado(reloj, auto);
    }
    else {
      vector.colas.aspirado.push(auto);
      vector.acumularEsperasColaAspirado();
    }

    // Iniciar lavado si al menos un operario está libre, agregar a la cola si están todos ocupados
    const opLavado = vector.operarios.lavado.find(
      ({ estado }) => estado === EstadoOperario.Libre,
    );

    if (opLavado) {
      opLavado.iniciarLavado(reloj, auto);
    }
    else {
      vector.colas.lavado.push(auto);
      vector.acumularEsperasColaLavado();
    }

    return vector;
  }

  function ejecutarFinAspirado(vector: VectorEstado, { reloj, evento, emisor }: IProximoEvento): VectorEstado {
    vector.reloj = reloj;
    vector.evento = evento;
    vector.emisor = emisor as Operario;

    // Finalizar aspirado
    const opAspirado = vector.emisor as OperarioAspirado;
    const auto = opAspirado.finalizarAspirado(reloj);

    /* Si la alfombra y carrocería están listas:
     * - Iniciar montado si el operario está libre
     * - Agregar a la cola si el operario está ocupado
     */
    if (auto.estado === EstadoAuto.EsperandoMontado) {
      const opMontado = vector.operarios.montado;

      if (opMontado.estado === EstadoOperario.Libre) {
        opMontado.iniciarMontado(reloj, auto);
      }
      else {
        vector.colas.montado.push(auto);
        vector.acumularEsperasColaMontado();
      }
    }

    return vector;
  }

  function ejecutarFinLavado(vector: VectorEstado, { reloj, evento, emisor }: IProximoEvento): VectorEstado {
    vector.reloj = reloj;
    vector.evento = evento;
    vector.emisor = emisor as Operario;

    // Finalizar lavado
    const opLavado = vector.emisor as OperarioLavado;
    const auto = opLavado.finalizarLavado(reloj);

    // Iniciar secado si el operario está libre, agregar a la cola si está ocupado
    const opSecado = vector.operarios.secado;

    if (opSecado.estado === EstadoOperario.Libre) {
      opSecado.iniciarSecado(reloj, auto);
    }
    else {
      vector.colas.secado.push(auto);
      vector.acumularEsperasColaSecado();
    }

    return vector;
  }

  function ejecutarFinSecado(vector: VectorEstado, { reloj, evento, emisor }: IProximoEvento): VectorEstado {
    vector.reloj = reloj;
    vector.evento = evento;
    vector.emisor = emisor as Operario;

    // Finalizar secado
    const opSecado = vector.emisor as OperarioSecado;
    const auto = opSecado.finalizarSecado(reloj);

    // Actualizar estado de operarios bloqueados
    const operariosBloqueados = vector.operarios.lavado.filter(
      ({ estado }) => estado === EstadoOperario.Bloqueado,
    );

    if (operariosBloqueados.length > 0) {
      if (vector.colas.lavado.length === 0) {
        // Liberar operarios
        operariosBloqueados.forEach(
          (operario) => { operario.estado = EstadoOperario.Libre; },
        );
      }

      else if (vector.colas.lavado.length === 1) {
        const [operarioLavado, ...operariosLiberados] = operariosBloqueados;

        // Iniciar lavado
        operarioLavado.iniciarLavado(reloj, vector.colas.lavado.shift() as Auto);

        // Liberar operarios
        operariosLiberados.forEach(
          (operario) => { operario.estado = EstadoOperario.Libre; },
        );
      }

      else {
        // Iniciar lavado
        const operarioLavado = operariosBloqueados[0];
        operarioLavado.iniciarLavado(reloj, vector.colas.lavado.shift() as Auto);
      }
    }

    /* Si la alfombra y carrocería están listas:
     * - Iniciar montado si el operario está libre
     * - Agregar a la cola si el operario está ocupado
     */
    if (auto.estado === EstadoAuto.EsperandoMontado) {
      const opMontado = vector.operarios.montado;

      if (opMontado.estado === EstadoOperario.Libre) {
        opMontado.iniciarMontado(reloj, auto);
      }
      else {
        vector.colas.montado.push(auto);
        vector.acumularEsperasColaMontado();
      }
    }

    return vector;
  }

  function ejecutarFinMontado(vector: VectorEstado, { reloj, evento, emisor }: IProximoEvento): VectorEstado {
    vector.reloj = reloj;
    vector.evento = evento;
    vector.emisor = emisor as Operario;

    // Finalizar montado
    const opMontado = vector.emisor as OperarioMontado;
    const auto = opMontado.finalizarMontado(reloj);

    // Calcular estadísticas
    vector.acumularTotalAutosProcesados();
    vector.promediarTiempoEnSistema(auto.finMontado as number - auto.tiempoLlegada);

    return vector;
  }

  function ejecutarProximoEvento(vector: VectorEstado): VectorEstado {
    vector.iteracion += 1;
    const eventos = vector.getProximosEventos();

    if (eventos.length === 0) {
      ejecutarFinSimulacion(vector);
    }

    const proximoEvento = _.minBy(eventos, 'reloj');

    if (proximoEvento?.evento === Evento.LlegadaAuto) {
      return ejecutarLlegadaAuto(vector, proximoEvento);
    }

    if (proximoEvento?.evento === Evento.FinDesmontado) {
      return ejecutarFinDesmontado(vector, proximoEvento);
    }

    if (proximoEvento?.evento === Evento.FinAspirado) {
      return ejecutarFinAspirado(vector, proximoEvento);
    }

    if (proximoEvento?.evento === Evento.FinLavado) {
      return ejecutarFinLavado(vector, proximoEvento);
    }

    if (proximoEvento?.evento === Evento.FinSecado) {
      return ejecutarFinSecado(vector, proximoEvento);
    }

    if (proximoEvento?.evento === Evento.FinMontado) {
      return ejecutarFinMontado(vector, proximoEvento);
    }

    return ejecutarFinSimulacion(vector);
  }

  function calcularResultados(vector: VectorEstado, parametros: IParameters): IResults {

  }

  function ejecutarSimulacion(
    iteraciones: number,
    parametros: IParameters,
    evaluador: TSamplingEvaluator,
  ): {
    vectores: ISerializableVectorEstado[],
    resultados: IResults,
  } {
    const vectores: ISerializableVectorEstado[] = veil([]);

    const vector: VectorEstado = ejecutarInicioSimulacion(parametros);
    if (evaluador(vector.iteracion)) {
      vectores.push(vector.toSerializable());
    }

    while (vector.evento !== Evento.FinSimulacion) {
      if (vector.iteracion === iteraciones - 1) {
        vector.iteracion += 1;
        ejecutarFinSimulacion(vector);
      }
      else {
        ejecutarProximoEvento(vector);
      }

      if (evaluador(vector.iteracion)) {
        vectores.push(vector.toSerializable());
      }
    }

    console.log('Vectores:', vectores);
    console.log(`Tiempo de simulación: ${vector.sistema.tiempoSimulacion} ms`);

    const resultados: IResults = calcularResultados(vector, parametros);

    return {
      vectores,
      resultados,
    };
  }

  function useSimulation(props: { parameters: IParameters }, emit: any) {
    const state = reactive({
      iteraciones: 1000000,
      condicionMuestreo: 'n <= 25 || !(n % 1000)',

      columnas: [
        {
          name: 'reloj',
          label: 'Reloj',
          field: (row: ISerializableVectorEstado) => row.reloj,
          align: 'right',
          required: true,
          format: round(2),
        },
        {
          name: 'evento',
          label: 'Evento',
          field: (row: ISerializableVectorEstado) => row.evento,
          align: 'left',
          required: true,
        },
        {
          name: 'emisor',
          label: 'Emisor',
          field: (row: ISerializableVectorEstado) => row.emisor.descripcion,
          align: 'left',
          required: true,
        },
      ],
      columnasVisibles: [
        'reloj', 'evento', 'emisor',
      ],

      vectores: [] as ISerializableVectorEstado[],
      resultados: {} as IResults,
      loading: false,

      onSubmit: () => {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
        const evaluadorMuestreo = new Function(
          'n', `return Boolean(${state.condicionMuestreo});`,
        ) as TSamplingEvaluator;

        state.vectores = [];
        state.loading = true;

        const { vectores, resultados } = ejecutarSimulacion(state.iteraciones, { ...props.parameters }, evaluadorMuestreo);

        state.loading = false;
        state.vectores = vectores;
        state.resultados = resultados;

        emit('finishRun', resultados);
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
