/**
 * Normalize the `jsParams`, convert types before sending to Lit Actions as jsParams, some JS types don't serialize well, so we will convert them before sending to the nodes
 *
 * It converts both
 *
 * @param {any} jsParams - The jsParams you are sending to Lit Action
 *
 *  * @returns { object } The jsParams object, but with any incompatible types automatically converted
 */
export const normalizeJsParams = (jsParams: any) => {
  for (const key of Object.keys(jsParams)) {
    const value = jsParams[key];
    if (ArrayBuffer.isView(value)) {
      // Correctly converting ArrayBuffer view to a standard array
      jsParams[key] = Array.from(
        new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      );
    } else if (value instanceof ArrayBuffer) {
      // Correctly converting plain ArrayBuffer to a standard array
      jsParams[key] = Array.from(new Uint8Array(value));
    }
  }
  return jsParams;
};
