import {
  TDistributionParameters,
  TDistributionValidators,
  ProbabilityDistribution,
} from 'models/ProbabilityDistribution';

import { required, gt, lt } from 'helpers/validation';

export const defaultParameters: TDistributionParameters = {
  ship: 0.5,
  head: 0.5,
};

export const defaultValidators: TDistributionValidators = {
  ship: [required(), gt(0), lt(1)],
  head: [required(), gt(0), lt(1)],
};

export class DiscreteDistribution extends ProbabilityDistribution {
  constructor(
    parameters: TDistributionParameters = defaultParameters,
    validators: TDistributionValidators = defaultValidators,
  ) {
    /* eslint-disable consistent-return */
    const generator = (
      probabilityParameters: TDistributionParameters,
    ) => {
      let accumulatedProbability = 0;
      const accumulatedProbabilities = Object
        .entries(probabilityParameters)
        .reduce((probabilities: Array<[string, number]>, [key, probability]) => {
          accumulatedProbability += probability;
          return probabilities.concat([
            [key, accumulatedProbability],
          ]);
        }, []);

      const random = Math.random();
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, probability] of accumulatedProbabilities) {
        if (random < probability) {
          return key;
        }
      }
    };
    /* eslint-enable consistent-return */
    super('discrete', parameters, validators, generator);
  }
}
