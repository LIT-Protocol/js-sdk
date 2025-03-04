import { pino } from 'pino';

import { LitActionResponseStrategy, NodeShare } from '@lit-protocol/types';

const logger = pino({
  level: 'info',
  name: 'process-lit-action-response-strategy',
});

/**
 * Finds the most and least common object within an of objects array
 * @param responses T[]
 * @returns an object which contains both the least and most occurring T items in the array
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
  responses: NodeShare[],
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
        logger.error(
          'Custom filter specified for response strategy but none found. using most common'
        );
      }
    } catch (e) {
      logger.error(
        'Error while executing custom response filter, defaulting to most common',
        (e as Error).toString()
      );
    }
  }

  const respFrequency = _findFrequency(copiedExecutionResponses);
  if (strategy?.strategy === 'leastCommon') {
    logger.info(
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.min;
  } else if (strategy?.strategy === 'mostCommon') {
    logger.info(
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.max;
  } else {
    logger.info(
      'no strategy found, using least common response object from execution results'
    );
    return respFrequency.min;
  }
};
