import * as LitJsSdk_accessControlConditions from '@litprotocol-dev/access-control-conditions';
import { useEffect, useRef } from 'react';

// create globalThis
declare global {
  interface Window {
    LitJsSdk_accessControlConditions: any;
  }
}

export function App() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    if(typeof LitJsSdk_accessControlConditions === 'undefined') {
      console.error("LitJsSdk_accessControlConditions:", LitJsSdk_accessControlConditions);
    }else{
        console.warn("LitJsSdk_accessControlConditions:", LitJsSdk_accessControlConditions);
        window.LitJsSdk_accessControlConditions = LitJsSdk_accessControlConditions;
    }
    window.addEventListener('load', function() {
      var root : any = document.getElementById('root');
      var result = document.getElementById('result');
      var entries = Object.entries(LitJsSdk_accessControlConditions);
      var lis : any = entries.map(([key, value]) => `
      <li>
          <span class="key" onClick="(async () => {
              var fn = LitJsSdk_accessControlConditions['${key}'];
              var fnType = typeof fn;
              console.warn('[${key}] is type of [' + fnType + ']');
              if ( fnType === 'string' ) return;

              if( fnType === 'function' ){
                  try{
                      console.log('params:', globalThis.params);
                      var res = await fn(globalThis.params);
                      res = JSON.stringify(res, null, 2);
                      result.innerText = res;
                      console.log(res);
                  }catch(e){
                      console.error('Please set the [params] variable in the console then click again');
                      console.log(e);
                  }
                  return;
              }

              if( fnType === 'object' ){
                  var res = await fn;
                  res = JSON.stringify(res, null, 2);
                  result.innerText = res;
                  console.log(res);
                  return;
              }
              
              
          })();">${key}</span>
          <pre class="code">
<code>${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
          </pre>
      </li>`);
      lis = lis.join(' ');
      var template = `
      <div class="cat">
          <h1>LitJsSdk_accessControlConditions has ${entries.length} functions</h1>
              <ul>
                  ${ lis }
              </ul>
          </div>
      `;
      root.insertAdjacentHTML('beforeend', template);
  });
  });

  const onLoad = (e: any) => {
    console.log('onLoad');
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          `,
        }}
      />
      <div id="root"></div>
    </>
  );
}

export default App;
