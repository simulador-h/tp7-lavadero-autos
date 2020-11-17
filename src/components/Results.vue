<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <q-markdown>
```js
{{ results }}
```
      </q-markdown>
      <q-markdown>
### Servidores [P]
--------------
- Desmontado
- Montado
- Aspirado
- Lavado
- Secado

### Clientes [T]
------------
- Auto (Alfombra, Carrocería)

### Eventos
-----------
- Inicio Simulacion
- Fin Simulacion
- Llegada Auto
- Fin Desmontado
- Fin Montado
- Fin Aspirado
- Fin Lavado
- Fin Secado
      </q-markdown>
      <q-markdown>
### Estados Servidor
--------------------
- Libre
- Ocupado
- Bloqueado

### Estados Auto
----------------
- Esperando Desmontado
- Siendo Desmontado
- Desmontado
- Esperando Alfombra
- Esperando Carroceria
- Esperando Montado
- Siendo Montado
- Montado

### Estados Alfombra
--------------------
- EsperandoAspirado
- SiendoAspirado
- Aspirado

### Estados Carrocería
----------------------
- EsperandoLavado
- SiendoLavado
- EsperandoSecado
- SiendoSecado
- Lavado
- Secado
      </q-markdown>
      <q-markdown>
### Colas
--------------------
- Desmontado
- Montado
- Aspirado
- Lavado
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
