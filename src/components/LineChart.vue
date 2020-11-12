<script>
  import { defineComponent } from '@vue/composition-api';

  import { Line } from 'vue-chartjs';

  export default defineComponent({
    name: 'LineChart',
    extends: Line,
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
