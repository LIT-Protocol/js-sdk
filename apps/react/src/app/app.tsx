// @ts-nocheck 
import { useEffect, useRef } from 'react';

import * as LitJsSdk_blsSdk from 'dist/packages/bls-sdk';
import * as LitJsSdk_constants from 'dist/packages/constants';
import * as LitJsSdk_ecdsaSdk from 'dist/packages/ecdsa-sdk';
import * as LitJsSdk_litThirdPartyLibs from 'dist/packages/lit-third-party-libs';
import * as LitJsSdk_nacl from 'dist/packages/nacl';

declare global {
  interface Window {
    LitJsSdk_blsSdk: any;
    LitJsSdk_constants: any;
    LitJsSdk_ecdsaSdk: any;
    LitJsSdk_litThirdPartyLibs: any;
    LitJsSdk_nacl: any;
  }
}

export function App() {
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        
    
    
        if(typeof LitJsSdk_blsSdk === 'undefined') {
            console.error("LitJsSdk_blsSdk:", LitJsSdk_blsSdk);
        }else{
            console.warn("LitJsSdk_blsSdk:", LitJsSdk_blsSdk);
            window.LitJsSdk_blsSdk = LitJsSdk_blsSdk;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_blsSdk);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_blsSdk_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_blsSdk['${key}'];
                    var fnType = typeof fn;
                    console.warn('[${key}] is type of [' + fnType + ']');

                    if ( fnType === 'string' ) return;

                    if( fnType === 'function' ){
                        try{
                            console.log('params:', globalThis.params);

                            var res;
                            try{
                                res = new fn(globalThis.params);
                            }catch{
                                res = await fn(globalThis.params);
                            }
                            window.output = res;
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
                        window.output = res;
                        res = JSON.stringify(res, null, 2);
                        result.innerText = res;
                        console.log(res);
                        return;
                    }
                    
                    
                })();">${key}</div>
                <pre class="code">
<code>${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
                </pre>
            </li>`);
            lis = lis.join(' ');
            var template = `
            <div class="cat">
                <h1>LitJsSdk_blsSdk has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_constants === 'undefined') {
            console.error("LitJsSdk_constants:", LitJsSdk_constants);
        }else{
            console.warn("LitJsSdk_constants:", LitJsSdk_constants);
            window.LitJsSdk_constants = LitJsSdk_constants;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_constants);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_constants_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_constants['${key}'];
                    var fnType = typeof fn;
                    console.warn('[${key}] is type of [' + fnType + ']');

                    if ( fnType === 'string' ) return;

                    if( fnType === 'function' ){
                        try{
                            console.log('params:', globalThis.params);

                            var res;
                            try{
                                res = new fn(globalThis.params);
                            }catch{
                                res = await fn(globalThis.params);
                            }
                            window.output = res;
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
                        window.output = res;
                        res = JSON.stringify(res, null, 2);
                        result.innerText = res;
                        console.log(res);
                        return;
                    }
                    
                    
                })();">${key}</div>
                <pre class="code">
<code>${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
                </pre>
            </li>`);
            lis = lis.join(' ');
            var template = `
            <div class="cat">
                <h1>LitJsSdk_constants has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_ecdsaSdk === 'undefined') {
            console.error("LitJsSdk_ecdsaSdk:", LitJsSdk_ecdsaSdk);
        }else{
            console.warn("LitJsSdk_ecdsaSdk:", LitJsSdk_ecdsaSdk);
            window.LitJsSdk_ecdsaSdk = LitJsSdk_ecdsaSdk;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_ecdsaSdk);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_ecdsaSdk_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_ecdsaSdk['${key}'];
                    var fnType = typeof fn;
                    console.warn('[${key}] is type of [' + fnType + ']');

                    if ( fnType === 'string' ) return;

                    if( fnType === 'function' ){
                        try{
                            console.log('params:', globalThis.params);

                            var res;
                            try{
                                res = new fn(globalThis.params);
                            }catch{
                                res = await fn(globalThis.params);
                            }
                            window.output = res;
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
                        window.output = res;
                        res = JSON.stringify(res, null, 2);
                        result.innerText = res;
                        console.log(res);
                        return;
                    }
                    
                    
                })();">${key}</div>
                <pre class="code">
<code>${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
                </pre>
            </li>`);
            lis = lis.join(' ');
            var template = `
            <div class="cat">
                <h1>LitJsSdk_ecdsaSdk has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_litThirdPartyLibs === 'undefined') {
            console.error("LitJsSdk_litThirdPartyLibs:", LitJsSdk_litThirdPartyLibs);
        }else{
            console.warn("LitJsSdk_litThirdPartyLibs:", LitJsSdk_litThirdPartyLibs);
            window.LitJsSdk_litThirdPartyLibs = LitJsSdk_litThirdPartyLibs;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_litThirdPartyLibs);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_litThirdPartyLibs_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_litThirdPartyLibs['${key}'];
                    var fnType = typeof fn;
                    console.warn('[${key}] is type of [' + fnType + ']');

                    if ( fnType === 'string' ) return;

                    if( fnType === 'function' ){
                        try{
                            console.log('params:', globalThis.params);

                            var res;
                            try{
                                res = new fn(globalThis.params);
                            }catch{
                                res = await fn(globalThis.params);
                            }
                            window.output = res;
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
                        window.output = res;
                        res = JSON.stringify(res, null, 2);
                        result.innerText = res;
                        console.log(res);
                        return;
                    }
                    
                    
                })();">${key}</div>
                <pre class="code">
<code>${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
                </pre>
            </li>`);
            lis = lis.join(' ');
            var template = `
            <div class="cat">
                <h1>LitJsSdk_litThirdPartyLibs has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_nacl === 'undefined') {
            console.error("LitJsSdk_nacl:", LitJsSdk_nacl);
        }else{
            console.warn("LitJsSdk_nacl:", LitJsSdk_nacl);
            window.LitJsSdk_nacl = LitJsSdk_nacl;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_nacl);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_nacl_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_nacl['${key}'];
                    var fnType = typeof fn;
                    console.warn('[${key}] is type of [' + fnType + ']');

                    if ( fnType === 'string' ) return;

                    if( fnType === 'function' ){
                        try{
                            console.log('params:', globalThis.params);

                            var res;
                            try{
                                res = new fn(globalThis.params);
                            }catch{
                                res = await fn(globalThis.params);
                            }
                            window.output = res;
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
                        window.output = res;
                        res = JSON.stringify(res, null, 2);
                        result.innerText = res;
                        console.log(res);
                        return;
                    }
                    
                    
                })();">${key}</div>
                <pre class="code">
<code>${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
                </pre>
            </li>`);
            lis = lis.join(' ');
            var template = `
            <div class="cat">
                <h1>LitJsSdk_nacl has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    

    window.onload = function() {
        [...document.getElementsByClassName('key')].forEach((e) => {
            e.addEventListener('mouseover', (ele) => {
                var code = ele.target.nextElementSibling.innerText;
                document.getElementById('result').innerText = code;
            });

            // e.addEventListener('click', (ele) => {
            //     ele.target.classList.add('active')
            // });
        });
    };

    });

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    
<style>
body {
    color: white;
    background: #16181C;
    padding: 12px;
}
.code {
    display: none;
}
div#root {
    width: 50%;
    display: grid;
    grid-template-columns: 1fr;
    border: 1px solid grey;
}
.cat {
    padding: 12px;
    border: 2px solid;
    margin: 2px;
    box-sizing: border-box;
}
.cat:hover {
    background: black;
    transition: 0.1s all linear;
}
ul {
    list-style-type: decimal;
}
#result{
    height: 100%;
    width: 50%;
    position: fixed;
    top: 0;
    right: 0;
    border-left: 2px solid black;
    padding: 48px;
    box-sizing: border-box;
    font-size: 14px;
    overflow: auto;
}
.key:hover, .active {
    text-decoration: underline;
    color: red;
    cursor: pointer;
}
pre {
    white-space: pre-wrap;       /* css-3 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
}
</style>
                    `,
                }}
            />
            (REACT) THIS FILE IS AUTOMATICALLY GENERATED FROM tools/scripts/gen-react.mjs Tue, 14 Feb 2023 17:35:00 GMT
            <div id="root"></div>
             <pre><code id="result"></code></pre>
        </>
    )
};