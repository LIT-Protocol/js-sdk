export const crossEnvSupport = () => {
    if (
        typeof global.TextEncoder === 'undefined' ||
        typeof global.TextDecoder === 'undefined'
    ) {
        console.warn("[Environment Detected] Node");
        const { TextEncoder, TextDecoder } = require('util');
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
    }else{
        console.warn("[Environment Detected] BROWSER]");
        
    }
}