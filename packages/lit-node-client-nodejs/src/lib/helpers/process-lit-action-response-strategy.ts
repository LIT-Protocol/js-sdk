import {
  LitActionResponseStrategy,
  ResponseStrategy,
  NodeShare,
} from '@lit-protocol/types';
import { log, logError } from '@lit-protocol/misc';

/**
 * Finds the most and least common object within an of objects array
 * @param responses any[]
 * @returns an object which contains both the least and most occuring item in the array
 */
const findFrequency = (responses: any[]): { min: any; max: any } => {
  var maxEl = responses[0],
    minEl = responses[0],
    maxCount = 1,
    minCount = 1;
  for (var i = 0; i < responses.length; i++) {
    var el = responses[i];
    if (responses[el] == null) responses[el] = 1;
    else responses[el]++;
    if (responses[el] > maxCount) {
      maxEl = el;
      maxCount = responses[el];
    } else if (responses[el] <= minCount) {
      minEl = el;
      minCount = responses[el];
    }
  }

  return { min: minEl, max: maxEl };
};
export const processLitActionResponseStrategy = (
  responses: NodeShare[],
  strategy: LitActionResponseStrategy
): any => {
  const executionResponses = responses.map((resp) => {
    return JSON.parse(resp.response);
  });
  const copiedExecutionResponses = executionResponses.map((r) => {
    return { ...r };
  });
  log(
    'filtered responses with frequency dist: ',
    JSON.stringify(copiedExecutionResponses)
  );
  if (strategy.strategy === 'custom') {
    try {
      if (strategy.customFilter) {
        const customResponseFilterResult =
          strategy?.customFilter(executionResponses);
        return customResponseFilterResult;
      } else {
        logError(
          'Custom filter specified for response strategy but none found. using most common'
        );
      }
    } catch (e) {
      logError(
        'Error while executing custom response filter, defaulting to most common',
        (e as Error).toString()
      );
    }
  }
  let respFrequency = findFrequency(copiedExecutionResponses);
  for (let i = 0; i < executionResponses.length; i++) {
    if (strategy?.strategy === 'leastCommon') {
      if (copiedExecutionResponses[i] === respFrequency.min) {
        log(
          'strategy found to be most common, taking most common response from execution results'
        );
        return executionResponses[i];
      }
    } else if (strategy?.strategy === 'mostCommon') {
      if (copiedExecutionResponses[i] === respFrequency.max) {
        log(
          'strategy found to be most common, taking most common response from execution results'
        );
        return executionResponses[i];
      }
    } else {
      if (copiedExecutionResponses[i].leastPopular === respFrequency.min) {
        log(
          'no strategy found, using least common response object from execution results'
        );
        return executionResponses[i];
      }
    }
  }
};
