import { jStat } from 'jstat';

import {
  TDistributionParameters,
  TDistributionValidators,
  ProbabilityDistribution,
} from 'models/ProbabilityDistribution';

import { required, gt } from 'helpers/validation';

export interface IExponentialParameters extends TDistributionParameters {
  rate: number
}

export interface IExponentialValidators extends TDistributionValidators {
  rate: Array<(value: number) => true | string>
}

export const defaultParameters: IExponentialParameters = {
  rate: 1,
};

export const defaultValidators: IExponentialValidators = {
  rate: [required(), gt(0)],
};

export class ExponentialDistribution extends ProbabilityDistribution {
  constructor(
    parameters: IExponentialParameters = defaultParameters,
    validators: IExponentialValidators = defaultValidators,
  ) {
    const generator = ({ rate }: TDistributionParameters) => jStat.exponential(rate).sample();
    super('exponential', parameters, validators, generator);
  }
}
