<template>
  <q-page padding>
    <q-form
      novalidate
      @submit.prevent="onSubmit"
      @reset="onReset"
    >
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-5 col-lg-4">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Condiciones
              </span>
              <q-icon name="fas fa-ruler" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <q-input
                v-model.number="condicionesIniciales.H"
                label="Humedad inicial"
                type="number"
                suffix="%"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0), v.lte(100)]"
              />

              <q-input
                v-model.number="h"
                label="Tamaño del paso"
                type="number"
                required
                outlined stack-label bottom-slots
                lazy-rules
                :rules="[v.required(), v.gt(0)]"
              >
                <template #hint>
                  <span>{{ h && u ? `${ h / u } minutos` : '' }}</span>
                </template>
              </q-input>

              <q-input
                v-model.number="u"
                label="Magnitud de integración"
                type="number"
                suffix="minutos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gt(0)]"
              />

              <q-input
                v-model.number="resultado"
                label="Tiempo de secado"
                type="number"
                suffix="minutos"
                readonly
                outlined stack-label hide-bottom-space
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-7 col-lg-8">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Gráfico
              </span>
              <q-icon name="fas fa-chart-area" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <line-chart :data="chartData" :options="chartOptions" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 row justify-end">
          <q-btn label="Simular" color="green" @click="onRun" />
          <div class="col-grow" />
          <q-btn label="Guardar" type="submit" color="primary" />
          <q-btn label="Restablecer" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<style lang="scss" scoped>
  .q-card .q-card__section .q-icon {
    font-size: 1.25rem;
  }
</style>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    watch,
    toRefs,
    PropType,
  } from '@vue/composition-api';

  import _ from 'lodash';
  import { ChartOptions } from 'chart.js';

  import LineChart from 'components/LineChart.vue';

  import * as v from 'helpers/validation';

  const eulerWorker = new Worker('workers/euler.worker.ts', { type: 'module' });

  interface IEstado {
    t: number
    H: number
  }

  export interface IEuler {
    condicionesIniciales: IEstado
    h: number
    u: number
    resultado?: number
  }

  export default defineComponent({
    name: 'Parameters',
    components: { LineChart },
    props: {
      euler: {
        required: true,
        type: Object as PropType<IEuler>,
      },
    },

    setup(props, { emit }) {
      const state = reactive({
        ..._.cloneDeep(props.euler),

        resultado: props.euler.resultado,

        chartData: {},
        chartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Humedad',
          },
          tooltips: {
            callbacks: {
              title([{ label }]) {
                return `Tiempo: ${Number(Number(label).toFixed(3))} minutos`;
              },
              label({ value }) {
                return `Humedad: ${Number(value).toFixed(3)}%`;
              },
            },
          },
          scales: {
            xAxes: [{
              type: 'linear',
              ticks: {
                min: 0,
                stepSize: 1,
              },
            }],
            yAxes: [{
              type: 'linear',
              ticks: {
                min: 0,
                max: 100,
                stepSize: 20,
              },
            }],
          },
        } as ChartOptions,
      });

      eulerWorker.onmessage = ({ data: estados }) => {
        state.resultado = estados[estados.length - 1].t;

        state.chartData = {
          datasets: [{
            label: 'H',
            data: estados.map(({ t: x, H: y }: IEstado) => ({ x, y })),
            borderWidth: 1,

            borderColor: 'rgb(103 194 58)',
            backgroundColor: 'rgba(103 194 58 / 60%)',

            pointBorderColor: 'rgb(103 194 58)',
            pointBackgroundColor: 'white',

            pointHoverBorderWidth: 2,
            pointHoverBorderColor: 'rgb(103 194 58)',
          }],
        };

        // @todo implement @change="" at form for dirty state management
      };

      const onRun = () => {
        eulerWorker.postMessage({
          condicionesIniciales: {
            t: state.condicionesIniciales.t,
            H: state.condicionesIniciales.H,
          },
          h: state.h,
          u: state.u,
          resultado: 'completo',
        });
      };

      const onSubmit = () => {
        // eslint-disable-next-line vue/require-explicit-emits
        emit('submit', {
          condicionesIniciales: state.condicionesIniciales,
          h: state.h,
          u: state.u,
          resultado: state.resultado,
        });
      };

      const onReset = () => {
        // eslint-disable-next-line vue/require-explicit-emits
        emit('reset');
      };

      onRun();

      watch(
        () => props.euler,
        () => {
          const { condicionesIniciales, h, u, resultado } = _.cloneDeep(props.euler);

          state.condicionesIniciales = condicionesIniciales;
          state.h = h;
          state.u = u;
          state.resultado = resultado;
        },
      );

      return {
        v,
        ...toRefs(state),
        onRun,
        onSubmit,
        onReset,
      };
    },
  });
</script>
