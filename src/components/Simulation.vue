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
    computed,
    toRefs,
    toRaw,
    PropType,
  } from '@vue/composition-api';

  import _ from 'lodash';
  import { jStat } from 'jstat';

  import * as v from 'helpers/validation';
  import { round, $, percent, fallback } from 'helpers/format';
  import { incrementalMean, incrementalStd } from 'helpers/statistics';

  import { IParameters } from 'components/Parameters.vue';
  import { IResults } from 'components/Results.vue';

  import { VectorEstado, ISerializableVectorEstado, Evento } from 'models/VectorEstado';

  type TSamplingEvaluator = (n: number) => boolean

  function generarInicioSimulacion(parametros: IParameters): VectorEstado {
    const vector = new VectorEstado(parametros);
    return vector;
  }

  function generarFinSimulacion(estado: VectorEstado, parametros: IParameters): VectorEstado {

  }

  function generarLlegadaAuto(estado: VectorEstado, parametros: IParameters): VectorEstado {

  }

  function generarFinDesmontado(estado: VectorEstado, parametros: IParameters): VectorEstado {

  }

  function ejecutarProximoEvento(estado: VectorEstado, parametros: IParameters): VectorEstado {

  }

  function calcularResultados(estado: VectorEstado, parametros: IParameters): IResults {

  }

  function ejecutarSimulacion(
    iteraciones: number,
    parametros: IParameters,
    evaluador: TSamplingEvaluator,
  ): {
    vectores: ISerializableVectorEstado[],
    resultados: IResults,
  } {
    console.log(parametros);
    let i = 1;
    const vectores: ISerializableVectorEstado[] = [];

    const estado: VectorEstado = generarInicioSimulacion(parametros);

    if (evaluador(i)) {
      vectores.push(estado.toSerializable());
    }

    while (i < iteraciones && estado.evento !== Evento.FinSimulacion) {
      ejecutarProximoEvento(estado, parametros);

      if (evaluador(i)) {
        vectores.push(estado.toSerializable());
      }

      i++;
    }

    const resultados: IResults = calcularResultados(estado, parametros);

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
          // format: round(2),
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
