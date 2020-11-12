<template>
  <q-layout view="hhh lpR fFf">
    <!-- master header -->
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat round dense
          icon="fas fa-bars"
          @click="drawerVisible = !drawerVisible"
        />

        <q-toolbar-title>
          Simulador H - TP7
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerVisible"
      behavior="desktop" mini bordered
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <drawer-link
            v-for="link in drawerLinks" :key="link.name"
            :link="link"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs } from '@vue/composition-api';

  import DrawerLink from 'components/DrawerLink.vue';

  function useMainLayout() {
    const state = reactive({
      drawerVisible: true,
      drawerLinks: [{
        name: 'Home',
        icon: 'fas fa-home',
        path: '/',
      }, {
        name: 'Simulación Montecarlo',
        icon: 'fas fa-running',
        path: '/montecarlo',
      }],
    });

    return toRefs(state);
  }

  export default defineComponent({
    name: 'MainLayout',
    components: { DrawerLink },
    setup() {
      return useMainLayout();
    },
  });
</script>
