<template>
  <q-item
    v-ripple
    :to="link.path"
    exact clickable
  >
    <q-item-section avatar>
      <q-icon :name="link.icon" size="xs" />
    </q-item-section>

    <q-item-section>
      {{ link.name }}
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
  import { defineComponent, PropType } from '@vue/composition-api';

  export interface IDrawerLink {
    name: string;
    icon: string;
    path: string;
  }

  export default defineComponent({
    name: 'DrawerLink',

    props: {
      link: {
        required: true,
        type: Object as PropType<IDrawerLink>,
      },
    },
  });
</script>
