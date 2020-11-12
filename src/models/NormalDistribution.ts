import { jStat } from 'jstat';

import {
  TDistributionParameters,
  TDistributionValidators,
  ProbabilityDistribution,
} from 'models/ProbabilityDistribution';

import { required, gt } from 'helpers/validation';

export interface INormalParameters extends TDistributionParameters {
  mean: number
  std: number
}

export interface INormalValidators extends TDistributionValidators {
  mean: Array<(value: number) => true | string>
  std: Array<(value: number) => true | string>
}

export const defaultParameters: INormalParameters = {
  mean: 0,
  std: 1,
};

export const defaultValidators: INormalValidators = {
  mean: [required()],
  std: [required(), gt(0)],
};

export class NormalDistribution extends ProbabilityDistribution {
  constructor(
    parameters: INormalParameters = defaultParameters,
    validators: INormalValidators = defaultValidators,
  ) {
    const generator = ({ mean, std }: TDistributionParameters) => jStat.normal(mean, std).sample();
    super('normal', parameters, validators, generator);
  }
}
