import _ from 'lodash';

import { es } from 'helpers/locale';

export type TDistributionParameters = Record<string, any>;
export type TDistributionValidators = Record<string, Array<(value: number) => true | string>>;
export type TDistributionGenerator = (parameters: TDistributionParameters) => any;

/**
 * @todo aggregate all parameter-related properties into a single parameter-object definition
 * @todo add method for issuing PRNGs
 * @todo add method for issuing a series of points for PDF graphing
 */
export class ProbabilityDistribution {
  public readonly type: string;
  public parameters: TDistributionParameters;
  public readonly validators: TDistributionValidators;
  public generator: TDistributionGenerator;

  constructor(
    type: string,
    parameters: TDistributionParameters = {},
    validators: TDistributionValidators = {},
    generator: TDistributionGenerator = () => NaN,
  ) {
    this.type = type;
    this.parameters = _.cloneDeep(parameters);
    this.validators = validators;
    this.generator = generator;
  }

  getReadableParameters(locale = es): string {
    const stringParameters = _.map(
      this.parameters,
      (value, parameter) => `${locale[parameter] ?? parameter} = ${Number(value.toFixed(3))}`,
    );

    return stringParameters.join('  ~  ');
  }

  clone(): ProbabilityDistribution {
    return new ProbabilityDistribution(this.type, this.parameters, this.validators, this.generator);
  }

  sample(): number {
    return this.generator(this.parameters);
  }
}

// var jStat = require("jstat");
// var _ = require("lodash");

// const distribution = jStat.exponential(.2);

// const mean = distribution.mean();
// const variance = distribution.variance();
// const std = Math.sqrt(variance);

// let lx = mean;
// let rx = mean;
// let p = distribution.pdf(mean);

// const probabilities = [{ x: mean, p }];

// while (p >= 0.001) {
//   lx -= std / 4;
//   rx += std / 4;
//   const lp = distribution.pdf(lx);
//   const rp = distribution.pdf(rx);

//   if (lp)
//     probabilities.push({ x: lx, p: lp });

//   if (rp)
//     probabilities.push({ x: rx, p: rp });

//   p = Math.max(lp, rp);
// }

// _.sortBy(probabilities, 'x');
