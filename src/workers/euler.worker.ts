/* eslint-disable no-restricted-globals */
import _ from 'lodash';

interface IData {
  condicionesIniciales: {
    E: number
    t: number
  }
  K: number | []
  h: number
  resultado: 'simple' | 'completo'
}

interface IEstado {
  t: number
  E: number
}

const ctx: Worker = self as any;

const fn = (t: number, E: number, K: number): number => (
  -K * E - 1.99 + 0.0001 * t
);

const tmin = (t: number, ut: number) => (
  t / ut
);

const euler = (h: number, K: number, condicionesIniciales: IEstado): IEstado[] => {
  let estado: IEstado = {
    t: condicionesIniciales.t,
    E: condicionesIniciales.E,
  };

  const estados: IEstado[] = [estado];

  do {
    const t = estado.t + h;
    const E = estado.E + h * fn(estado.t, estado.E, K);

    estado = { t, E };
    estados.push(estado);
  }
  while (estado.E > 0);

  return estados.map(({ t, E }) => ({ t: tmin(t, 0.5), E }));
};

ctx.onmessage = ({
  data: { h, K, condicionesIniciales, resultado = 'simple' },
}: {
  data: IData
}) => {
  // eslint-disable-next-line no-underscore-dangle
  let _K;

  if (typeof K === 'number') {
    _K = [K, K];
  }
  else {
    _K = K;
  }

  const [min, max, precision = 3] = _K;
  const pasoK = 1 / 10 ** precision;

  const resultados = (new Array(
    (max - min) / pasoK + 1,
  ))
    .fill(undefined)
    .map(
      (v, i) => {
        const k = min + i * pasoK;
        const estados = euler(h, k, condicionesIniciales);

        return [
          k.toFixed(precision),
          (resultado === 'completo') ? estados : estados[estados.length - 1].t,
        ];
      },
    );

  ctx.postMessage(
    _.fromPairs(resultados),
  );
};
