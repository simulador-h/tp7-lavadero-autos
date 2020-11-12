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
                Pedidos
              </span>
              <q-icon name="fas fa-boxes" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <probability-distribution
                v-model="pedidos.demanda"
                label="Demanda"
              />
              <probability-distribution
                v-model="pedidos.tipo"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Entregas
              </span>
              <q-icon name="fas fa-hand-holding-heart" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <q-input
                v-model.number="entregas.tiempoLimiteCobro"
                label="Tiempo límite de cobro"
                type="number"
                suffix="minutos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="entregas.tiempoLimiteEspera"
                label="Tiempo límite de espera"
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
                Sandwiches
              </span>
              <q-icon name="fas fa-bread-slice" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <q-input
                v-model.number="pedidos.sandwiches.precioVenta"
                label="Precio de venta"
                type="number"
                prefix="$"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <probability-distribution
                v-model="pedidos.sandwiches.tiempoPreparacion"
                label="Tiempo de preparación"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Pizzas
              </span>
              <q-icon name="fas fa-pizza-slice" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <q-input
                v-model.number="pedidos.pizzas.precioVenta"
                label="Precio de venta"
                type="number"
                prefix="$"
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
                Empanadas
              </span>
              <q-icon name="fas fa-brain" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <probability-distribution
                v-model="pedidos.empanadas.cantidadPedido"
                label="Cantidad de pedido"
              />

              <q-input
                v-model.number="pedidos.empanadas.precioVenta"
                label="Precio de venta"
                type="number"
                prefix="$"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="pedidos.empanadas.tiempoPreparacionMedio"
                label="Tiempo de preparación medio"
                type="number"
                suffix="minutos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="pedidos.empanadas.tiempoPreparacionCompleto"
                label="Tiempo de preparación completo"
                type="number"
                suffix="minutos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="pedidos.empanadas.capacidadMaximaFreidora"
                label="Capacidad máxima por freidora"
                type="number"
                suffix="empanadas"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(1)]"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center justify-between">
              <span class="text-uppercase text-caption text-primary">
                Hamburgesas
              </span>
              <q-icon name="fas fa-hamburger" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <q-input
                v-model.number="pedidos.hamburgesas.precioVenta"
                label="Precio de venta"
                type="number"
                prefix="$"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="pedidos.hamburgesas.tiempoPreparacion"
                label="Tiempo de preparación"
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
                Lomitos
              </span>
              <q-icon name="fas fa-bacon" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <q-input
                v-model.number="pedidos.lomitos.precioVenta"
                label="Precio de venta"
                type="number"
                prefix="$"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
              />

              <q-input
                v-model.number="pedidos.lomitos.tiempoPreparacion"
                label="Tiempo de preparación"
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
                Envíos
              </span>
              <q-icon name="fas fa-shipping-fast" class="text-primary" />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="q-gutter-md">
              <probability-distribution
                v-model="envios.tiempoEnvio"
                label="Tiempo de envío"
              />

              <q-input
                v-model.number="envios.cantidadMaximaPorEnvio"
                label="Cantidad máxima por envío"
                type="number"
                suffix="pedidos"
                required
                outlined stack-label
                hide-bottom-space lazy-rules
                :rules="[v.required(), v.gte(0)]"
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
    pedidos: {
      demanda: Distribution
      tipo: Distribution

      sandwiches: {
        cantidadPedido: Distribution | number
        precioVenta: number
        tiempoPreparacion: Distribution | number
      }
      pizzas: {
        cantidadPedido: Distribution | number
        precioVenta: number
        tiempoPreparacion: Distribution | number
      }
      empanadas: {
        cantidadPedido: Distribution | number
        precioVenta: number
        capacidadMaximaFreidora: number
        tiempoPreparacionMedio: number
        tiempoPreparacionCompleto: number
      }
      hamburgesas: {
        cantidadPedido: Distribution | number
        precioVenta: number
        tiempoPreparacion: Distribution | number
      }
      lomitos: {
        cantidadPedido: Distribution | number
        precioVenta: number
        tiempoPreparacion: Distribution | number
      }
    }
    envios: {
      tiempoEnvio: Distribution
      cantidadMaximaPorEnvio: number
    }
    entregas: {
      tiempoLimiteCobro: number
      tiempoLimiteEspera: number
    }
    turnos: {
      duracionTurno: number
    }
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
          const { pedidos, envios, entregas, turnos } = _.cloneDeep(props.parameters);

          state.pedidos = pedidos;
          state.envios = envios;
          state.entregas = entregas;
          state.turnos = turnos;
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
