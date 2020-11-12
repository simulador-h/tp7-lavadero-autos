<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo entre pedidos
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.tiempoEntreLlegadas.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.tiempoEntreLlegadas.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-boxes" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Cantidad de pedidos por hora
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.cantidadPedidos.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.cantidadPedidos.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-boxes" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tipo de producto pedido
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                Object
                  .entries(
                    runResults.mañana.tipoProductoPedido,
                  )
                  .map(([tipoPedido, cantidad]) => `${tipoPedido} = ${cantidad}`)
                  .join('\n')
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo de preparación de sándwich
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.tiempoPreparacionSandwich.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.tiempoPreparacionSandwich.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo de cocción de pizzas
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.tiempoPreparacionPizza.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.tiempoPreparacionPizza.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-brain" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo de cocción de empanadas
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.tiempoPreparacionEmpanadas.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.tiempoPreparacionEmpanadas.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Cantidad de empanadas demandadas
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.demandaEmpanadas.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.demandaEmpanadas.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-hamburger" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Ingreso por hamburguesas y lomitos
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.mañana.ingresoHamburguesaLomito.promedio.toFixed(2)
                } +- ${
                  runResults.mañana.ingresoHamburguesaLomito.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 q-pb-md">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-hat-chef" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Orden en el uso de los empleados de cocción
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{ runResults.mañana.ordenCocineros }}
            </span>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo entre pedidos
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.tiempoEntreLlegadas.promedio.toFixed(2)
                } +- ${
                  runResults.noche.tiempoEntreLlegadas.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-boxes" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Cantidad de pedidos por hora
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.cantidadPedidos.promedio.toFixed(2)
                } +- ${
                  runResults.noche.cantidadPedidos.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-boxes" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tipo de producto pedido
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                Object
                  .entries(
                    runResults.noche.tipoProductoPedido,
                  )
                  .map(([tipoPedido, cantidad]) => `${tipoPedido} = ${cantidad}`)
                  .join('\n')
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo de preparación de sándwich
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.tiempoPreparacionSandwich.promedio.toFixed(2)
                } +- ${
                  runResults.noche.tiempoPreparacionSandwich.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo de cocción de pizzas
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.tiempoPreparacionPizza.promedio.toFixed(2)
                } +- ${
                  runResults.noche.tiempoPreparacionPizza.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-brain" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Tiempo de cocción de empanadas
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.tiempoPreparacionEmpanadas.promedio.toFixed(2)
                } +- ${
                  runResults.noche.tiempoPreparacionEmpanadas.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Cantidad de empanadas demandadas
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.demandaEmpanadas.promedio.toFixed(2)
                } +- ${
                  runResults.noche.demandaEmpanadas.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-hamburger" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Ingreso por hamburguesas y lomitos
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{
                `${
                  runResults.noche.ingresoHamburguesaLomito.promedio.toFixed(2)
                } +- ${
                  runResults.noche.ingresoHamburguesaLomito.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 q-pb-md">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-hat-chef" class="text-primary" />
            <span class="text-uppercase text-caption text-primary">
              Orden en el uso de los empleados de cocción
            </span>
            <span class="text-uppercase text-caption text-primary">
              {{ runResults.noche.ordenCocineros }}
            </span>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md text-dark">
      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" />
            <span class="text-uppercase text-caption">
              Tiempo promedio libre de los empleados de cocción
            </span>
            <span class="text-uppercase text-caption">
              {{ results.tiempoPromedioLibreCocineros.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" />
            <span class="text-uppercase text-caption">
              Tiempo promedio libre de los empleados de delivery
            </span>
            <span class="text-uppercase text-caption">
              {{ results.tiempoPromedioLibreRepartidores.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" />
            <span class="text-uppercase text-caption">
              Tiempo promedio de espera para comenzar a ser procesado cada pedido
            </span>
            <span class="text-uppercase text-caption">
              {{ results.esperaPromedioEnColaPreparacion.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-clock" />
            <span class="text-uppercase text-caption">
              Tiempo promedio de entrega del pedido desde que el cliente hizo el pedido
            </span>
            <span class="text-uppercase text-caption">
              {{ results.tiempoPromedioEnSistema.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-dollar-sign" />
            <span class="text-uppercase text-caption">
              Ventas perdidas en promedio por día
            </span>
            <span class="text-uppercase text-caption">
              {{ results.ventasAbandonadas.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-dollar-sign" />
            <span class="text-uppercase text-caption">
              Valor de las ventas no realizadas
            </span>
            <span class="text-uppercase text-caption">
              {{ results.perdidasVenta.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-dollar-sign" />
            <span class="text-uppercase text-caption">
              Número máximo de ventas perdidas
            </span>
            <span class="text-uppercase text-caption">
              {{ results.maxVentasAbandonadas.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-dollar-sign" />
            <span class="text-uppercase text-caption">
              Ventas con entrega gratuita por día
            </span>
            <span class="text-uppercase text-caption">
              {{ results.pedidosGratis.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-dollar-sign" />
            <span class="text-uppercase text-caption">
              Valor promedio de los ingresos
            </span>
            <span class="text-uppercase text-caption">
              {{ results.ingresosVenta.total.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-dollar-sign" />
            <span class="text-uppercase text-caption">
              Ingresos promedio diarios y desvío
            </span>
            <span class="text-uppercase text-caption">
              {{
                `${
                  results.ingresosVenta.promedio.toFixed(2)
                } +- ${
                  results.ingresosVenta.desviacion.toFixed(2)
                }`
              }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-chart-bar" />
            <span class="text-uppercase text-caption">
              ¿Cuál es la probabilidad de obtener $250 o menos en cada pedido entregados?
            </span>
            <span class="text-uppercase text-caption">
              {{ results.probabilidadIngresoMenor250.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-6 col-lg-6">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center justify-between">
            <q-icon name="fas fa-chart-bar" />
            <span class="text-uppercase text-caption">
              ¿Cuál es la probabilidad de que abandonen o sean gratis 5 o más pedidos por día?
            </span>
            <span class="text-uppercase text-caption">
              {{ results.pedidosAbandonadosOGratisMayor5.toFixed(2) }}
            </span>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
  import {
    defineComponent,
    PropType,
  } from '@vue/composition-api';

  export interface IResults {
    tiempoPromedioLibreCocineros: number
    tiempoPromedioLibreRepartidores: number
    ventasAbandonadas: number
    maxVentasAbandonadas: number
    pedidosGratis: number
    perdidasVenta: number
    ingresosVenta: {
      total: number
      promedio: number
      desviacion: number
    }
    esperaPromedioEnColaPreparacion: number
    tiempoPromedioEnSistema: number
    probabilidadIngresoMenor250: number
    pedidosAbandonadosOGratisMayor5: number
  }

  export interface IRunResults {
    tiempoEntreLlegadas: {
      cantidad: number
      promedio: number
      desviacion: number
    }
    cantidadPedidos: {
      promedio: number
      desviacion: number
    }
    tipoProductoPedido: Record<string, number>,
    tiempoPreparacionSandwich: {
      promedio: number
      desviacion: number
    }
    tiempoPreparacionPizza: {
      promedio: number
      desviacion: number
    }
    tiempoPreparacionEmpanadas: {
      promedio: number
      desviacion: number
    }
    demandaEmpanadas: {
      promedio: number
      desviacion: number
    }
    ingresoHamburguesaLomito: {
      promedio: number
      desviacion: number
    }
    ordenCocineros: number[],
    tiempoEntrega: {
      promedio: number
      desviacion: number
    }
  }

  export default defineComponent({
    name: 'Simulation',
    components: {},
    props: {
      results: {
        required: true,
        type: Object as PropType<IResults>,
      },
      runResults: {
        required: true,
        type: Object as PropType<{
          mañana: IRunResults,
          noche: IRunResults,
        }>,
      },
    },
  });
</script>
