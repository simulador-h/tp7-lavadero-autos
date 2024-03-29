<template>
  <q-page>
    <q-tabs
      v-model="activeTab"
      align="justify"
      active-color="primary"
      indicator-color="primary"
      class="text-grey"
    >
      <q-tab name="parameters" label="Parámetros" />
      <q-tab name="euler" label="Euler" />
      <q-tab name="simulation" label="Simulación" />
      <q-tab name="results" label="Resultados" :disable="!showResults" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated keep-alive>
      <q-tab-panel name="parameters">
        <parameters :parameters="parameters" @submit="saveParameters" @reset="reloadParameters" />
      </q-tab-panel>
      <q-tab-panel name="euler">
        <euler :euler="euler" @submit="saveEuler" @reset="reloadEuler" />
      </q-tab-panel>
      <q-tab-panel name="simulation">
        <simulation :parameters="parameters" :euler="euler" @finishRun="finishRun" />
      </q-tab-panel>
      <q-tab-panel name="results">
        <results :results="results" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    computed,
    toRefs,
  } from '@vue/composition-api';

  import _ from 'lodash';

  import { UniformDistribution } from 'models/UniformDistribution';
  import { ExponentialDistribution } from 'models/ExponentialDistribution';

  import Euler, { IEuler } from 'components/Euler.vue';
  import Parameters, { IParameters } from 'components/Parameters.vue';
  import Results, { IResults } from 'components/Results.vue';
  import Simulation from 'components/Simulation.vue';

  const defaultEuler: IEuler = {
    condicionesIniciales: {
      t: 0,
      H: 100,
    },
    h: 0.01,
    u: 1,
    resultado: 2.3099999999999947,
  };

  const defaultParameters: IParameters = {
    tiempoEntreLlegadas: new ExponentialDistribution({ rate: 1 / 10 }),

    tiempoDesmontado: 2,
    tiempoMontado: 3,

    tiempoAspiradoAlfombra: new UniformDistribution({ a: 3, b: 5 }),

    tiempoLavadoCarroceria: new UniformDistribution({ a: 6, b: 12 }),
    tiempoSecadoCarroceria: defaultEuler.resultado as number,
  };

  function useMontecarlo() {
    const state: any = reactive({
      activeTab: 'parameters',
      parameters: _.cloneDeep(defaultParameters),
      euler: _.cloneDeep(defaultEuler),
      results: {},
      showResults: computed(
        () => !_.isEmpty(state.results),
      ),

      saveParameters: (parameters: IParameters) => {
        state.parameters = _.cloneDeep(parameters);
      },
      reloadParameters: () => {
        state.parameters = _.cloneDeep(defaultParameters);
      },
      saveEuler: (euler: IEuler) => {
        state.euler = _.cloneDeep(euler);
        state.parameters = {
          ...state.parameters,
          tiempoSecadoCarroceria: euler.resultado,
        };
      },
      reloadEuler: () => {
        state.euler = _.cloneDeep(defaultEuler);
      },
      finishRun: (results: IResults) => {
        state.results = results;
      },
    });

    return toRefs(state);
  }

  export default defineComponent({
    name: 'Montecarlo',
    components: { Parameters, Euler, Simulation, Results },
    setup() {
      return useMontecarlo();
    },
  });
</script>
