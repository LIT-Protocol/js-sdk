export const GEN_STYLE = `
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
.key:hover {
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
</style>`;

export const GEN_FOOTER_SCRIPTS = `
<script>
    window.onload = function() {
        [...document.getElementsByClassName('key')].forEach((e) => {
            e.addEventListener('mouseover', (ele) => {
                var code = ele.target.nextElementSibling.innerText;
                document.getElementById('result').innerText = code;
            });
        });
    };
</script>`;

/**
// --- Template look something like this ---
// if(typeof LitJsSdk_constants === 'undefined') {
//     console.error("LitJsSdk_constants:", LitJsSdk_constants);
//  }else{
//     console.warn("LitJsSdk_constants:", LitJsSdk_constants);
//     window.LitJsSdk_constants = LitJsSdk_constants;
//  }
// window.addEventListener('load', function() {
//     var entries = Object.entries(LitJsSdk_authBrowser);
//     var lis = entries.map(([key, value]) => '<li><span class="key">' + key + '</span><pre class="code"><code>' + (typeof value === 'function' ? value : JSON.stringify(value, null, 2)) + '</code></pre></li>');
//     lis = lis.join(',', '').replaceAll(',', '');
//     var template = `<div class="cat"><h1>LitJsSdk_authBrowser has ${entries.length} functions</h1><ul>${ lis }</ul></div>`;
//     document.getElementById('root').insertAdjacentHTML('beforeend', template);
// });
 */
export const getConsoleTemplate = (name, i, globalVarPrefix, isReact=false) => {

    const capitalisedName = name.split(globalVarPrefix)[1].toUpperCase();

    return `
    ${!isReact ? `<!-- (${i + 1}): ${capitalisedName} -->` : ''}
    ${!isReact ? `<script>` : ''}
        if(typeof ${name} === 'undefined') {
            console.error("${name}:", ${name});
        }else{
            console.warn("${name}:", ${name});
            window.${name} = ${name};
        }
        window.addEventListener('load', function() {
            var root = document.getElementById('root');
            var result = document.getElementById('result');
            var entries = Object.entries(${name});
            var lis = entries.map(([key, value]) => \`
            <li>
                <span id="${name}" class="key" onClick="(async () => {
                    var fn = ${name}['\${key}'];
                    var fnType = typeof fn;
                    console.warn('[\${key}] is type of [' + fnType + ']');
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
                    
                    
                })();">\${key}</span>
                <pre class="code">
<code>\${(typeof value === 'function' ? value : JSON.stringify(value, null, 2))}</code>
                </pre>
            </li>\`);
            lis = lis.join(' ');
            var template = \`
            <div class="cat">
                <h1>${name} has \${entries.length} functions</h1>
                    <ul>
                        \${ lis }
                    </ul>
                </div>
            \`;
            root.insertAdjacentHTML('beforeend', template);
        });
    ${!isReact ? `</script>` : ''}
    `;
}