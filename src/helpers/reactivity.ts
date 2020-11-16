/* eslint-disable no-underscore-dangle */
import Vue from 'vue';

const Observer = (new Vue()).$data.__ob__.constructor;

export const veil = (target: any) => {
  target.__ob__ = new Observer({});
  return target;
};
