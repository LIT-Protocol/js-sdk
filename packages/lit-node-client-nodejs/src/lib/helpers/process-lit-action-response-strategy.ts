import { log, logError } from '@lit-protocol/misc';
import {
  LitActionResponseStrategy,
  ExecuteJsValueResponse,
} from '@lit-protocol/types';

/**
 * Finds the most and least common object within an of objects array
 * @param responses any[]
 * @returns an object which contains both the least and most occurring item in the array
 */
const _findFrequency = <T>(responses: T[]): { min: T; max: T } => {
  const sorted = responses.sort(
    (a, b) =>
      responses.filter((v) => v === a).length -
      responses.filter((v) => v === b).length
  );

  return { min: sorted[0], max: sorted[sorted?.length - 1] };
};

export const processLitActionResponseStrategy = (
  responses: ExecuteJsValueResponse[],
  strategy: LitActionResponseStrategy
) => {
  const executionResponses = responses.map((nodeResp) => {
    return nodeResp.response;
  });

  const copiedExecutionResponses = executionResponses.map((r) => {
    return '' + r;
  });
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

  const respFrequency = _findFrequency(copiedExecutionResponses);
  if (strategy?.strategy === 'leastCommon') {
    log(
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.min;
  } else if (strategy?.strategy === 'mostCommon') {
    log(
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.max;
  } else {
    log(
      'no strategy found, using least common response object from execution results'
    );
    return respFrequency.min;
  }
};
