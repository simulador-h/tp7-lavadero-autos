<template>
  <q-page padding>
    <q-form
      novalidate
      @submit.prevent="onSubmit"
      @reset="onReset"
    >
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Autos
              </span>
              <q-icon name="fas fa-boxes" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <probability-distribution
                v-model="tiempoEntreLlegadas"
                label="Tiempo entre llegadas"
              />

              <q-input
                v-model.number="tiempoDesmontado"
                label="Tiempo de desmontado"
                type="number"
                suffix="minutos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="tiempoMontado"
                label="Tiempo de montado"
                type="number"
                suffix="minutos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Alfombras
              </span>
              <q-icon name="fas fa-hand-holding-heart" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <probability-distribution
                v-model="tiempoAspiradoAlfombra"
                label="Tiempo de aspirado"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Carrocerías
              </span>
              <q-icon name="fas fa-bread-slice" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <probability-distribution
                v-model="tiempoLavadoCarroceria"
                label="Tiempo de lavado"
              />

              <q-input
                v-model.number="tiempoSecadoCarroceria"
                label="Tiempo de secado"
                type="number"
                suffix="minutos"
                readonly
                outlined stack-label hide-bottom-space
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 row justify-end">
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

  import { ProbabilityDistribution as Distribution } from 'models/ProbabilityDistribution';

  import ProbabilityDistribution from 'components/ProbabilityDistribution.vue';

  import * as v from 'helpers/validation';

  export interface IParameters {
    tiempoEntreLlegadas: Distribution

    tiempoDesmontado: number
    tiempoMontado: number

    tiempoAspiradoAlfombra: Distribution

    tiempoLavadoCarroceria: Distribution
    tiempoSecadoCarroceria: number
  }

  export default defineComponent({
    name: 'Parameters',
    components: { ProbabilityDistribution },
    props: {
      parameters: {
        required: true,
        type: Object as PropType<IParameters>,
      },
    },

    setup(props, { emit }) {
      const state = reactive(
        _.cloneDeep(props.parameters),
      );

      const onSubmit = () => {
        // eslint-disable-next-line vue/require-explicit-emits
        emit('submit', state);
      };

      const onReset = () => {
        // eslint-disable-next-line vue/require-explicit-emits
        emit('reset');
      };

      watch(
        () => props.parameters,
        () => {
          const {
            tiempoEntreLlegadas,
            tiempoDesmontado,
            tiempoMontado,
            tiempoAspiradoAlfombra,
            tiempoLavadoCarroceria,
            tiempoSecadoCarroceria,
          } = _.cloneDeep(props.parameters);

          state.tiempoEntreLlegadas = tiempoEntreLlegadas;
          state.tiempoDesmontado = tiempoDesmontado;
          state.tiempoMontado = tiempoMontado;
          state.tiempoAspiradoAlfombra = tiempoAspiradoAlfombra;
          state.tiempoLavadoCarroceria = tiempoLavadoCarroceria;
          state.tiempoSecadoCarroceria = tiempoSecadoCarroceria;
        },
      );

      return {
        v,
        ...toRefs(state),
        onSubmit,
        onReset,
      };
    },
  });
</script>
