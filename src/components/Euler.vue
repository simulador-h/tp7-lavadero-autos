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
                v-model.number="condicionesIniciales.E"
                label="Índice de elaboración inicial"
                type="number"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0), v.lte(100)]"
              />

              <q-input
                v-model.number="K"
                label="Coeficiente K"
                type="number"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0.3), v.lte(0.8)]"
              />

              <q-input
                v-model.number="h"
                label="Tamaño del paso"
                type="number"
                required
                outlined stack-label bottom-slots
                lazy-rules
                :rules="[v.required(), v.gte(0)]"
              >
                <template #hint>
                  <span>{{ h ? `${ h / ut } minutos` : '' }}</span>
                </template>
              </q-input>
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

  export interface IEuler {
    condicionesIniciales: {
      E: number
      t: number
    }
    K: number
    h: number
    ut: number
  }

  interface IEstado {
    t: number
    E: number
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

        chartData: {},
        chartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Índice de elaboración',
          },
          tooltips: {
            callbacks: {
              title([{ label }]) {
                return `${Number(Number(label).toFixed(3))} minutos`;
              },
              label({ value }) {
                return `E: ${Number(value).toFixed(3)}`;
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

      eulerWorker.onmessage = ({ data }) => {
        const estados = _.values(data)[0];

        state.chartData = {
          datasets: [{
            label: 'E',
            data: estados.map(({ t: x, E: y }: IEstado) => ({ x, y })),
            borderWidth: 1,

            borderColor: 'rgb(103 194 58)',
            backgroundColor: 'rgba(103 194 58 / 60%)',

            pointBorderColor: 'rgb(103 194 58)',
            pointBackgroundColor: 'white',

            pointHoverBorderWidth: 2,
            pointHoverBorderColor: 'rgb(103 194 58)',
          }],
        };
      };

      const onRun = () => {
        eulerWorker.postMessage({
          condicionesIniciales: {
            E: state.condicionesIniciales.E,
            t: state.condicionesIniciales.t,
          },
          K: state.K,
          h: state.h,
          ut: state.ut,
          resultado: 'completo',
        });
      };

      const onSubmit = () => {
        // eslint-disable-next-line vue/require-explicit-emits
        emit('submit', {
          condicionesIniciales: state.condicionesIniciales,
          K: state.K,
          h: state.h,
          ut: state.ut,
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
          const { condicionesIniciales, K, h, ut } = _.cloneDeep(props.euler);

          state.condicionesIniciales = condicionesIniciales;
          state.K = K;
          state.h = h;
          state.ut = ut;
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
