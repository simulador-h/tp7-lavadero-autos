<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <q-markdown>
```js
{{ results }}
```
      </q-markdown>
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

  import { QMarkdown } from '@quasar/quasar-ui-qmarkdown';

  export interface IResults {
    autos: {
      totalProcesados: number
      tiempoPromedioEnSistema: number
    }
    operarios: {
      desmontado: {
        tiempoOcupado: number
        probabilidadOcupado: number
        cola: {
          esperas: number
          probabilidad: number
          maximo: number
        }
      }
      aspirado: {
        tiempoOcupado: number
        probabilidadOcupado: number
        cola: {
          esperas: number
          probabilidad: number
          maximo: number
        }
      }
      lavado: {
        tiempoOcupado: number
        probabilidadOcupado: number
        bloqueos: number
        probabilidadBloqueado: number
        cola: {
          esperas: number
          probabilidad: number
          maximo: number
        }
      }
      secado: {
        tiempoOcupado: number
        probabilidadOcupado: number
        cola: {
          esperas: number
          probabilidad: number
          maximo: number
        }
      }
      montado: {
        tiempoOcupado: number
        probabilidadOcupado: number
        cola: {
          esperas: number
          probabilidad: number
          maximo: number
        }
      }
    }
  }

  export default defineComponent({
    name: 'Simulation',
    components: { QMarkdown },
    props: {
      results: {
        required: true,
        type: Object as PropType<IResults>,
      },
    },
  });
</script>
