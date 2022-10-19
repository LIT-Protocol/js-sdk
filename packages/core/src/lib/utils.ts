// Contants
const skLen = 32; // bytes
const pkLen = 48; // bytes
const sigLen = 96; // bytes
const maxMsgLen = 1049600; // bytes
const maxCtLen = 1049600; // bytes
const decryptionShareLen = 48; // bytes

// the number of bytes in a row derived from a BivarPoly
// which varies depending on the threshold.
const row_sizes_by_threshold = [
    40, // threshold 0
    72, // threshold 1
    104, // threshold 2
    136, // threshold 3
    168, // threshold 4
    200, // threshold 5
    232, // threshold 6
    264, // threshold 7
    296, // threshold 8
    328, // threshold 9
    360, // threshold 10
];

// the number of bytes in a commitment derived from a BivarPoly
// which varies depending on the threshold.
const commitment_sizes_by_threshold = [
    56, // threshold 0
    104, // threshold 1
    152, // threshold 2
    200, // threshold 3
    248, // threshold 4
    296, // threshold 5
    344, // threshold 6
    392, // threshold 7
    440, // threshold 8
    488, // threshold 9
    536, // threshold 10
];

// the number of bytes in the master secret key (Poly)
// which varies depending on the threshold.
const poly_sizes_by_threshold = [
    40, // threshold 0
    72, // threshold 1
    104, // threshold 2
    136, // threshold 3
    168, // threshold 4
    200, // threshold 5
    232, // threshold 6
    264, // threshold 7
    296, // threshold 8
    328, // threshold 9
    360, // threshold 10
];

// Encoding conversions

// modified from https://stackoverflow.com/a/11058858
function asciiToUint8Array(a: any) {
    let b = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        b[i] = a.charCodeAt(i);
    }
    return b;
}

// https://stackoverflow.com/a/19102224
// TODO resolve RangeError possibility here, see SO comments
const uint8ArrayToAscii = (a: any) => {
    return String.fromCharCode.apply(null, a);
};

// https://stackoverflow.com/a/50868276
const hexToUint8Array = (h: any) => {
    if (h.length == 0) {
        return new Uint8Array();
    }
    return new Uint8Array(
        h.match(/.{1,2}/g).map((byte: any) => parseInt(byte, 16))
    );
};

const uint8ArrayToHex = (a: any) => {
    return a.reduce(
        (str: string, byte: any) => str + byte.toString(16).padStart(2, '0'),
        ''
    );
};

const uint8ArrayToByteStr = (a: any) => {
    return '[' + a.join(', ') + ']';
};

const base64abc = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '+',
    '/',
];

const base64codes = [
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255,
    255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255,
    255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
    49, 50, 51,
];

const getBase64Code = (charCode: any) => {
    if (charCode >= base64codes.length) {
        throw new Error('Unable to parse base64 string.');
    }
    const code = base64codes[charCode];

    if (code === 255) {
        throw new Error('Unable to parse base64 string.');
    }

    return code;
};

const base64ToUint8Array = (str: string) => {
    if (str.length % 4 !== 0) {
        throw new Error('Unable to parse base64 string.');
    }
    const index = str.indexOf('=');

    if (index !== -1 && index < str.length - 2) {
        throw new Error('Unable to parse base64 string.');
    }

    let missingOctets = str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0,
        n = str.length,
        result = new Uint8Array(3 * (n / 4)),
        buffer;

    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
        buffer =
            (getBase64Code(str.charCodeAt(i)) << 18) |
            (getBase64Code(str.charCodeAt(i + 1)) << 12) |
            (getBase64Code(str.charCodeAt(i + 2)) << 6) |
            getBase64Code(str.charCodeAt(i + 3));
        result[j] = buffer >> 16;
        result[j + 1] = (buffer >> 8) & 0xff;
        result[j + 2] = buffer & 0xff;
    }

    return result.subarray(0, result.length - missingOctets);
};

const uint8ArrayToBase64 = (bytes: any) => {
    let result = '',
        i,
        l = bytes.length;

    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3f];
    }

    if (i === l + 1) {
        // 1 octet yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += '==';
    }

    if (i === l) {
        // 2 octets yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0f) << 2];
        result += '=';
    }

    return result;
};