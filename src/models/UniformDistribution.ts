import { jStat } from 'jstat';

import {
  TDistributionParameters,
  TDistributionValidators,
  ProbabilityDistribution,
} from 'models/ProbabilityDistribution';

import { required } from 'helpers/validation';

export interface IUniformParameters extends TDistributionParameters {
  a: number
  b: number
}

export interface IUniformValidators extends TDistributionValidators {
  a: Array<(value: number) => true | string>
  b: Array<(value: number) => true | string>
}

export const defaultParameters: IUniformParameters = {
  a: 0,
  b: 1,
};

export const defaultValidators: IUniformValidators = {
  a: [required()],
  b: [required()],
};

export class UniformDistribution extends ProbabilityDistribution {
  constructor(
    parameters: IUniformParameters = defaultParameters,
    validators: IUniformValidators = defaultValidators,
  ) {
    const generator = ({ a, b }: TDistributionParameters) => jStat.uniform(a, b).sample();
    super('uniform', parameters, validators, generator);
  }
}
