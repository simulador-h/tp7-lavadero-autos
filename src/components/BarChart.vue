<script>
  import { defineComponent } from '@vue/composition-api';

  import { Bar } from 'vue-chartjs';

  export default defineComponent({
    name: 'BarChart',
    extends: Bar,
    props: {
      data: {
        type: Object,
        required: true,
      },
      options: {
        type: Object,
        default: () => ({}),
      },
    },
    watch: {
      options() {
        this.renderChart(this.data, this.options);
      },
      data() {
        this.renderChart(this.data, this.options);
      },
    },
    mounted() {
      this.renderChart(this.data, this.options);
    },
  });
</script>
