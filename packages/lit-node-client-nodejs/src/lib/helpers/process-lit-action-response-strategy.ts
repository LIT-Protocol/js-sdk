import {
  LitActionResponseStrategy,
  ResponseStrategy,
  NodeShare,
} from '@lit-protocol/types';
import { log, logError } from '@lit-protocol/misc';
import { LogLevel } from '@lit-protocol/constants';

/**
 * Finds the most and least common object within an of objects array
 * @param responses any[]
 * @returns an object which contains both the least and most occuring item in the array
 */
const _findFrequency = (responses: string[]): { min: any; max: any } => {
  const sorted = responses.sort(
    (a: any, b: any) =>
      responses.filter((v: any) => v === a).length -
      responses.filter((v: any) => v === b).length
  );

  return { min: sorted[0], max: sorted[sorted?.length - 1] };
};

export const processLitActionResponseStrategy = (
  responses: NodeShare[],
  strategy: LitActionResponseStrategy
): any => {
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

  let respFrequency = _findFrequency(copiedExecutionResponses);
  if (strategy?.strategy === 'leastCommon') {
    log(
      LogLevel.INFO,
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.min;
  } else if (strategy?.strategy === 'mostCommon') {
    log(
      LogLevel.INFO,
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.max;
  } else {
    log(
      LogLevel.INFO,
      'no strategy found, using least common response object from execution results'
    );
    respFrequency.min;
  }
};
