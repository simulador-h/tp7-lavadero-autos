<template>
  <fragment>
    <q-select
      v-model="type" :options="types"
      emit-value map-options
      :label="label"
      outlined stack-label bottom-slots
      required
    >
      <template #hint>
        <span>{{ value.getReadableParameters() }}</span>
      </template>

      <template #after>
        <q-btn
          class="text-primary"
          icon="fas fa-bars"
          flat round dense
          @click="onConfig"
        />
      </template>
    </q-select>

    <q-dialog
      v-model="showConfig"
      @hide="onCancel"
    >
      <q-card class="bg-transparent" style="width: 300px">
        <q-form autofocus novalidate @submit.prevent.stop="onSubmit">
          <q-card-section class="row items-center justify-between bg-primary text-white">
            <span class="text-uppercase text-caption text-weight-medium">
              Parámetros
            </span>
            <q-icon name="fas fa-cogs" />
          </q-card-section>

          <q-card-section class="bg-white q-pb-sm">
            <div class="q-gutter-md">
              <q-input
                v-for="(val, key) in configurableDistribution.parameters" :key="key"
                v-model.number="configurableDistribution.parameters[key]"
                :label="es[key] || key"
                type="number" required
                outlined stack-label
                bottom-slots hide-bottom-space lazy-rules
                :rules="configurableDistribution.validators[key] || []"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right" class="bg-white text-primary">
            <q-btn label="Guardar" type="submit" flat />
            <q-btn v-close-popup label="Cancelar" class="text-grey" flat />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </fragment>
</template>

<style lang="scss" scoped>
  /deep/ .q-field__messages {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    span {
      white-space: pre;
    }
  }
</style>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    toRefs,
    computed,
    watch,
    PropType,
    SetupContext,
  } from '@vue/composition-api';

  import {
    Fragment,
  } from 'vue-fragment';

  import _ from 'lodash';

  import { ProbabilityDistribution } from 'models/ProbabilityDistribution';
  import { UniformDistribution } from 'models/UniformDistribution';
  import { NormalDistribution } from 'models/NormalDistribution';
  import { ExponentialDistribution } from 'models/ExponentialDistribution';
  import { PoissonDistribution } from 'models/PoissonDistribution';
  import { DiscreteDistribution } from 'models/DiscreteDistribution';

  import { es } from 'helpers/locale';

  // @todo make known distributions configurable
  const knownDistributions: Record<string, ProbabilityDistribution> = {
    uniform: new UniformDistribution(),
    normal: new NormalDistribution(),
    exponential: new ExponentialDistribution(),
    poisson: new PoissonDistribution(),
    discrete: new DiscreteDistribution(),
  };

  function useProbabilityDistribution(
    props: { value: ProbabilityDistribution },
    { emit }: SetupContext,
  ) {
    const state = reactive({
      configurableDistribution: props.value.clone(),

      type: computed({
        get: () => props.value.type,
        set: (type) => {
          const distribution = knownDistributions[type];
          emit('input', distribution.clone());
        },
      }),
      types: _.map(knownDistributions, (
        distribution,
        type,
      ) => ({
        label: _.startCase(es[type] ?? type),
        value: type,
      })),

      showConfig: false,

      onConfig: () => {
        state.showConfig = true;
      },
      onSubmit: () => {
        emit('input', state.configurableDistribution);
        state.configurableDistribution = state.configurableDistribution.clone();
        state.showConfig = false;
      },
      onCancel: () => {
        state.configurableDistribution = props.value.clone();
        state.showConfig = false;
      },
    });

    watch(
      () => props.value,
      () => {
        state.configurableDistribution = props.value.clone();
      },
    );

    return toRefs(state);
  }

  export default defineComponent({
    name: 'ProbabilityDistribution',
    components: { Fragment },
    props: {
      value: {
        type: Object as PropType<ProbabilityDistribution>,
        required: true,
      },
      label: {
        type: String,
        required: false,
        default: 'Distribución',
      },
    },

    setup(props, ctx) {
      return {
        es,
        ...useProbabilityDistribution(props, ctx),
      };
    },
  });
</script>
