// @ts-nocheck 
import { useEffect, useRef } from 'react';

import * as LitJsSdk_accessControlConditions from 'dist/packages/access-control-conditions';
import * as LitJsSdk_authBrowser from 'dist/packages/auth-browser';
import * as LitJsSdk_blsSdk from 'dist/packages/bls-sdk';
import * as LitJsSdk_constants from 'dist/packages/constants';
import * as LitJsSdk_contractsSdk from 'dist/packages/contracts-sdk';
import * as LitJsSdk_crypto from 'dist/packages/crypto';
import * as LitJsSdk_ecdsaSdk from 'dist/packages/ecdsa-sdk';
import * as LitJsSdk_encryption from 'dist/packages/encryption';
import * as LitJsSdk_litNodeClient from 'dist/packages/lit-node-client';
import * as LitJsSdk_litNodeClientNodejs from 'dist/packages/lit-node-client-nodejs';
import * as LitJsSdk_litThirdPartyLibs from 'dist/packages/lit-third-party-libs';
import * as LitJsSdk_misc from 'dist/packages/misc';
import * as LitJsSdk_miscBrowser from 'dist/packages/misc-browser';
import * as LitJsSdk_nacl from 'dist/packages/nacl';
import * as LitJsSdk_pkpEthers from 'dist/packages/pkp-ethers';
import * as LitJsSdk_types from 'dist/packages/types';
import * as LitJsSdk_uint8arrays from 'dist/packages/uint8arrays';

declare global {
  interface Window {
    LitJsSdk_accessControlConditions: any;
    LitJsSdk_authBrowser: any;
    LitJsSdk_blsSdk: any;
    LitJsSdk_constants: any;
    LitJsSdk_contractsSdk: any;
    LitJsSdk_crypto: any;
    LitJsSdk_ecdsaSdk: any;
    LitJsSdk_encryption: any;
    LitJsSdk_litNodeClient: any;
    LitJsSdk_litNodeClientNodejs: any;
    LitJsSdk_litThirdPartyLibs: any;
    LitJsSdk_misc: any;
    LitJsSdk_miscBrowser: any;
    LitJsSdk_nacl: any;
    LitJsSdk_pkpEthers: any;
    LitJsSdk_types: any;
    LitJsSdk_uint8arrays: any;
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

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_accessControlConditions);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_accessControlConditions_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_accessControlConditions['${key}'];
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
                <h1>LitJsSdk_accessControlConditions has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_authBrowser === 'undefined') {
            console.error("LitJsSdk_authBrowser:", LitJsSdk_authBrowser);
        }else{
            console.warn("LitJsSdk_authBrowser:", LitJsSdk_authBrowser);
            window.LitJsSdk_authBrowser = LitJsSdk_authBrowser;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_authBrowser);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_authBrowser_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_authBrowser['${key}'];
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
                <h1>LitJsSdk_authBrowser has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
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
    
    

    
    
        if(typeof LitJsSdk_contractsSdk === 'undefined') {
            console.error("LitJsSdk_contractsSdk:", LitJsSdk_contractsSdk);
        }else{
            console.warn("LitJsSdk_contractsSdk:", LitJsSdk_contractsSdk);
            window.LitJsSdk_contractsSdk = LitJsSdk_contractsSdk;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_contractsSdk);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_contractsSdk_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_contractsSdk['${key}'];
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
                <h1>LitJsSdk_contractsSdk has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_crypto === 'undefined') {
            console.error("LitJsSdk_crypto:", LitJsSdk_crypto);
        }else{
            console.warn("LitJsSdk_crypto:", LitJsSdk_crypto);
            window.LitJsSdk_crypto = LitJsSdk_crypto;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_crypto);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_crypto_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_crypto['${key}'];
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
                <h1>LitJsSdk_crypto has ${entries.length} functions</h1>
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
    
    

    
    
        if(typeof LitJsSdk_encryption === 'undefined') {
            console.error("LitJsSdk_encryption:", LitJsSdk_encryption);
        }else{
            console.warn("LitJsSdk_encryption:", LitJsSdk_encryption);
            window.LitJsSdk_encryption = LitJsSdk_encryption;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_encryption);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_encryption_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_encryption['${key}'];
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
                <h1>LitJsSdk_encryption has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_litNodeClient === 'undefined') {
            console.error("LitJsSdk_litNodeClient:", LitJsSdk_litNodeClient);
        }else{
            console.warn("LitJsSdk_litNodeClient:", LitJsSdk_litNodeClient);
            window.LitJsSdk_litNodeClient = LitJsSdk_litNodeClient;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_litNodeClient);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_litNodeClient_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_litNodeClient['${key}'];
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
                <h1>LitJsSdk_litNodeClient has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_litNodeClientNodejs === 'undefined') {
            console.error("LitJsSdk_litNodeClientNodejs:", LitJsSdk_litNodeClientNodejs);
        }else{
            console.warn("LitJsSdk_litNodeClientNodejs:", LitJsSdk_litNodeClientNodejs);
            window.LitJsSdk_litNodeClientNodejs = LitJsSdk_litNodeClientNodejs;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_litNodeClientNodejs);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_litNodeClientNodejs_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_litNodeClientNodejs['${key}'];
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
                <h1>LitJsSdk_litNodeClientNodejs has ${entries.length} functions</h1>
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
    
    

    
    
        if(typeof LitJsSdk_misc === 'undefined') {
            console.error("LitJsSdk_misc:", LitJsSdk_misc);
        }else{
            console.warn("LitJsSdk_misc:", LitJsSdk_misc);
            window.LitJsSdk_misc = LitJsSdk_misc;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_misc);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_misc_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_misc['${key}'];
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
                <h1>LitJsSdk_misc has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_miscBrowser === 'undefined') {
            console.error("LitJsSdk_miscBrowser:", LitJsSdk_miscBrowser);
        }else{
            console.warn("LitJsSdk_miscBrowser:", LitJsSdk_miscBrowser);
            window.LitJsSdk_miscBrowser = LitJsSdk_miscBrowser;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_miscBrowser);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_miscBrowser_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_miscBrowser['${key}'];
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
                <h1>LitJsSdk_miscBrowser has ${entries.length} functions</h1>
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
    
    

    
    
        if(typeof LitJsSdk_pkpEthers === 'undefined') {
            console.error("LitJsSdk_pkpEthers:", LitJsSdk_pkpEthers);
        }else{
            console.warn("LitJsSdk_pkpEthers:", LitJsSdk_pkpEthers);
            window.LitJsSdk_pkpEthers = LitJsSdk_pkpEthers;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_pkpEthers);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_pkpEthers_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_pkpEthers['${key}'];
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
                <h1>LitJsSdk_pkpEthers has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_types === 'undefined') {
            console.error("LitJsSdk_types:", LitJsSdk_types);
        }else{
            console.warn("LitJsSdk_types:", LitJsSdk_types);
            window.LitJsSdk_types = LitJsSdk_types;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_types);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_types_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_types['${key}'];
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
                <h1>LitJsSdk_types has ${entries.length} functions</h1>
                    <ul>
                        ${ lis }
                    </ul>
                </div>
            `;
            root.insertAdjacentHTML('beforeend', template);
        });
    
    

    
    
        if(typeof LitJsSdk_uint8arrays === 'undefined') {
            console.error("LitJsSdk_uint8arrays:", LitJsSdk_uint8arrays);
        }else{
            console.warn("LitJsSdk_uint8arrays:", LitJsSdk_uint8arrays);
            window.LitJsSdk_uint8arrays = LitJsSdk_uint8arrays;
        }
        window.addEventListener('load', function() {

            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(LitJsSdk_uint8arrays);
            var lis = entries.map(([key, value]) => `
            <li>
                <div id="LitJsSdk_uint8arrays_${key}" class="key" onClick="(async (e) => {
                    var fn = LitJsSdk_uint8arrays['${key}'];
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
                <h1>LitJsSdk_uint8arrays has ${entries.length} functions</h1>
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
            (REACT) THIS FILE IS AUTOMATICALLY GENERATED FROM tools/scripts/gen-react.mjs Fri, 17 Mar 2023 07:08:02 GMT
            <div id="root"></div>
             <pre><code id="result"></code></pre>
        </>
    )
};