/* global Lit */

import { AbortError } from './abortError';

export async function litActionHandler(actionFunc) {
  try {
    const litActionResult = await actionFunc();
    // Don't re-stringify a string; we don't want to double-escape it
    const response =
      typeof litActionResult === 'string'
        ? litActionResult
        : JSON.stringify(litActionResult);

    Lit.Actions.setResponse({ response });
  } catch (err) {
    // AbortError means exit immediately and do _NOT_ set a response
    // Nested code should really only throw this in cases where using e.g. `decryptToSingleNode`
    // And this execution isn't that node.
    if (err instanceof AbortError) {
      return;
    }

    Lit.Actions.setResponse({ response: `Error: ${err.message}` });
  }
}
