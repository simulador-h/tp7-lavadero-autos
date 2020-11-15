/* eslint-disable no-restricted-globals */

interface IData {
  condicionesIniciales: {
    t: number
    H: number
  }
  h: number
  u: number
  resultado: 'simple' | 'completo'
}

interface IEstado {
  t: number
  H: number
}

const ctx: Worker = self as any;

const fn = (t: number, H: number): number => (
  -5 * (t ** 2) + 2 * H - 200
);

const tmin = (t: number, u: number) => (
  t / u
);

const euler = (h: number, u: number, condicionesIniciales: IEstado): IEstado[] => {
  let estado: IEstado = {
    t: condicionesIniciales.t,
    H: condicionesIniciales.H,
  };

  const estados: IEstado[] = [estado];

  do {
    const t = estado.t + h;
    const H = estado.H + h * fn(estado.t, estado.H);

    estado = { t, H };
    estados.push(estado);
  }
  while (estado.H > 0);

  return estados.map(({ t, H }) => ({ t: tmin(t, u), H }));
};

ctx.onmessage = ({
  data: { h, u, condicionesIniciales, resultado = 'simple' },
}: {
  data: IData
}) => {
  const estados = euler(h, u, condicionesIniciales);

  ctx.postMessage(
    (resultado === 'completo') ? estados : estados[estados.length - 1],
  );
};
