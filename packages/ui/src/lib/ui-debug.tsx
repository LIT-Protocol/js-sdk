// Usage
{
  /* <DebugViewer states={[
    {formReady},
    {selectedEvent},
    {jsCode},
    {jsonCode},
    {msg},
    {name},
  ]} /> */
}
import * as React from 'react';

const DebugViewer = ({ states }: { states: any }) => {
  // react use effect
  React.useEffect(() => {
    console.log('DebugViewer mounted');

    // check if window.hash is set to debug
    if (window.location.hash === '#debug') {
      document.body.classList.add('debug');
    }

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#debug') {
        document.body.classList.add('debug');
      } else {
        document.body.classList.remove('debug');
      }
    });

    return () => {
      console.log('DebugViewer unmounted');
    };
  }, []);

  return (
    <div className="DEBUG">
      <h2>Debug Viewer</h2>
      <ul>
        {!states
          ? ''
          : states.map((state: any, index: number) => {
              const varName = Object.keys(state)[0];
              const varValue = state[varName];
              return (
                <li key={index} className="flex gap-12">
                  <div>{varName} </div>
                  <div>
                    {
                      // check if varValue is boolean
                      typeof varValue === 'boolean'
                        ? varValue
                          ? 'true'
                          : 'false'
                        : // check if varValue is an object
                        typeof varValue === 'object'
                        ? JSON.stringify(varValue)
                        : // check if varValue is an array
                        Array.isArray(varValue)
                        ? JSON.stringify(varValue)
                        : // check if varValue is a string
                        typeof varValue === 'string'
                        ? varValue
                        : // check if varValue is a number
                        typeof varValue === 'number'
                        ? varValue
                        : // check if varValue is a function
                        typeof varValue === 'function'
                        ? varValue
                        : // check if varValue is null
                        varValue === null
                        ? 'null'
                        : // check if varValue is undefined
                        varValue === undefined
                        ? 'undefined'
                        : // check if varValue is NaN
                        isNaN(varValue)
                        ? 'NaN'
                        : // check if varValue is a symbol
                        typeof varValue === 'symbol'
                        ? varValue
                        : // check if varValue is a bigint
                        typeof varValue === 'bigint'
                        ? varValue
                        : // check if varValue is a date
                        varValue instanceof Date
                        ? varValue
                        : // check if varValue is a regexp
                        varValue instanceof RegExp
                        ? varValue
                        : // check if varValue is a promise
                        varValue instanceof Promise
                        ? varValue
                        : // check if varValue is a map
                        varValue instanceof Map
                        ? varValue
                        : // check if varValue is a set
                        varValue instanceof Set
                        ? varValue
                        : // check if varValue is an error
                        varValue instanceof Error
                        ? varValue
                        : // check if varValue is a weakmap
                        varValue instanceof WeakMap
                        ? varValue
                        : // check if varValue is a weakset
                        varValue instanceof WeakSet
                        ? varValue
                        : // check if varValue is an arraybuffer
                        varValue instanceof ArrayBuffer
                        ? varValue
                        : // check if varValue is a sharedarraybuffer
                        varValue instanceof SharedArrayBuffer
                        ? varValue
                        : // check if varValue is a dataview
                        varValue instanceof DataView
                        ? varValue
                        : // check if varValue is a typedarray
                        varValue instanceof Int8Array ||
                          varValue instanceof Uint8Array ||
                          varValue instanceof Uint8ClampedArray ||
                          varValue instanceof Int16Array ||
                          varValue instanceof Uint16Array ||
                          varValue instanceof Int32Array ||
                          varValue instanceof Uint32Array ||
                          varValue instanceof Float32Array ||
                          varValue instanceof Float64Array
                        ? varValue
                        : // check if varValue is a blob
                        varValue instanceof Blob
                        ? varValue
                        : // check if varValue is a file
                        varValue instanceof File
                        ? varValue
                        : // check if varValue is a filelist
                        varValue instanceof FileList
                        ? varValue
                        : // check if varValue is a imagebitmap
                        varValue instanceof ImageBitmap
                        ? varValue
                        : // check if varValue is a imagedata
                        varValue instanceof ImageData
                        ? varValue
                        : // check if varValue is a arraybuffer
                        varValue instanceof ArrayBuffer
                        ? varValue
                        : // check if varValue is a sharedarraybuffer
                        varValue instanceof SharedArrayBuffer
                        ? varValue
                        : // check if varValue is a dataview
                        varValue instanceof DataView
                        ? varValue
                        : // check if varValue is a typedarray
                        varValue instanceof Int8Array ||
                          varValue instanceof Uint8Array ||
                          varValue instanceof Uint8ClampedArray ||
                          varValue instanceof Int16Array ||
                          varValue instanceof Uint16Array ||
                          varValue instanceof Int32Array ||
                          varValue instanceof Uint32Array ||
                          varValue instanceof Float32Array ||
                          varValue instanceof Float64Array
                        ? varValue
                        : // check if varValue is a blob
                        varValue instanceof Blob
                        ? varValue
                        : // check if varValue is a file
                        varValue instanceof File
                        ? varValue
                        : // check if varValue is a filelist
                        varValue instanceof FileList
                        ? varValue
                        : // check if varValue is a imagebitmap
                        varValue instanceof ImageBitmap
                        ? varValue
                        : // check if varValue is a imagedata
                        varValue instanceof ImageData
                        ? varValue
                        : // check if varValue is a arraybuffer
                        varValue instanceof ArrayBuffer
                        ? varValue
                        : // check if varValue is a sharedarraybuffer
                        varValue instanceof SharedArrayBuffer
                        ? varValue
                        : // check if varValue is a dataview
                        varValue instanceof DataView
                        ? varValue
                        : // check if varValue is a typedarray
                        varValue instanceof Int8Array ||
                          varValue instanceof Uint8Array ||
                          varValue instanceof Uint8ClampedArray ||
                          varValue instanceof Int16Array ||
                          varValue instanceof Uint16Array ||
                          varValue instanceof Int32Array ||
                          varValue instanceof Uint32Array ||
                          varValue instanceof Float32Array ||
                          varValue instanceof Float64Array
                        ? varValue
                        : // check if varValue is a blob
                        varValue instanceof Blob
                        ? varValue
                        : // check if varValue is a file
                        varValue instanceof File
                        ? varValue
                        : // check if varValue is a filelist
                        varValue instanceof FileList
                        ? varValue
                        : // check if varValue is a imagebitmap
                        varValue instanceof ImageBitmap
                        ? varValue
                        : // check if varValue is a imagedata
                        varValue instanceof ImageData
                        ? varValue
                        : // check if varValue is a arraybuffer
                        varValue instanceof ArrayBuffer
                        ? varValue
                        : // check if varValue is a sharedarraybuffer
                        varValue instanceof SharedArrayBuffer
                        ? varValue
                        : // check if varValue is a dataview
                        varValue instanceof DataView
                        ? varValue
                        : // check if varValue is a typedarray
                        varValue instanceof Int8Array ||
                          varValue instanceof Uint8Array ||
                          varValue instanceof Uint8ClampedArray ||
                          varValue instanceof Int16Array ||
                          varValue instanceof Uint16Array ||
                          varValue instanceof Int32Array ||
                          varValue instanceof Uint32Array ||
                          varValue instanceof Float32Array ||
                          varValue instanceof Float64Array
                        ? varValue
                        : // check if varValue is a blob
                        varValue instanceof Blob
                        ? varValue
                        : ''
                    }
                  </div>
                </li>
              );
            })}
      </ul>
      {/* formReady: {formReady ? 'true' : 'false'}
      <br />
      name: {name}
      <br />
      selectedEvent: {selectedEvent}
      <br />
      jsCode: {jsCode}
      <br />
      jsonCode: {jsonCode}
      <br /> */}
    </div>
  );
};
export default DebugViewer;
