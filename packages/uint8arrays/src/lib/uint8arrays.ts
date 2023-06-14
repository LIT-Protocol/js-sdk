// /**
// utf8Encode - Encodes a given string into a UTF-8 encoded Uint8Array.
// @param {string} str - The input string to be encoded.
// @returns {Uint8Array} utf8Array - The UTF-8 encoded Uint8Array of the input string.
// */
function utf8Encode(str: string): Uint8Array {
  // Initialize an empty array to store the UTF-8 encoded dat
  let utf8Array: number[] = [];

  // Iterate through the characters of the input string
  for (let i = 0; i < str.length; i++) {
    // Get the Unicode character code of the current character
    let charCode = str.charCodeAt(i);

    // If the character code is less than 128 (ASCII range)
    if (charCode < 128) {
      // Directly push the character code into the UTF-8 array
      utf8Array.push(charCode);

      // If the character code is between 128 and 2047 (2-byte sequence)
    } else if (charCode < 2048) {
      // Push the two-byte sequence of the character code into the UTF-8 array
      utf8Array.push(192 | (charCode >> 6), 128 | (charCode & 63));
    } else if (
      // Check if the character is a high surrogate (UTF-16)
      (charCode & 0xfc00) === 0xd800 &&
      i + 1 < str.length &&
      (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
    ) {
      // Combine the high and low surrogate pair into a single UTF-32 code point
      charCode =
        0x10000 + ((charCode & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);

      // Push the four-byte sequence of the character code into the UTF-8 array
      utf8Array.push(
        240 | (charCode >> 18),
        128 | ((charCode >> 12) & 63),
        128 | ((charCode >> 6) & 63),
        128 | (charCode & 63)
      );
    } else {
      // If the character code is between 2048 and 65535 (3-byte sequence)

      // Push the three-byte sequence of the character code into the UTF-8 array
      utf8Array.push(
        224 | (charCode >> 12),
        128 | ((charCode >> 6) & 63),
        128 | (charCode & 63)
      );
    }
  }

  return new Uint8Array(utf8Array);
}

// /**

// utf8Decode - Decodes a given UTF-8 encoded Uint8Array into a string.
// @param {Uint8Array} utf8Array - The input UTF-8 encoded Uint8Array to be decoded.
// @returns {string} str - The decoded string from the input UTF-8 encoded Uint8Array.
// */
export function utf8Decode(utf8Array: Uint8Array): string {
  let str = '';
  let i = 0;

  while (i < utf8Array.length) {
    let charCode = utf8Array[i++];

    if (charCode < 128) {
      str += String.fromCharCode(charCode);
    } else if (charCode > 191 && charCode < 224) {
      str += String.fromCharCode(
        ((charCode & 31) << 6) | (utf8Array[i++] & 63)
      );
    } else if (charCode > 239 && charCode < 365) {
      charCode =
        ((charCode & 7) << 18) |
        ((utf8Array[i++] & 63) << 12) |
        ((utf8Array[i++] & 63) << 6) |
        (utf8Array[i++] & 63);
      charCode -= 0x10000;
      str += String.fromCharCode(
        0xd800 + (charCode >> 10),
        0xdc00 + (charCode & 0x3ff)
      );
    } else {
      str += String.fromCharCode(
        ((charCode & 15) << 12) |
          ((utf8Array[i++] & 63) << 6) |
          (utf8Array[i++] & 63)
      );
    }
  }

  return str;
}

export function base64ToUint8Array(base64Str: string): Uint8Array {
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return bytes;
}

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binaryStr = '';

  for (let i = 0; i < uint8Array.length; i++) {
    binaryStr += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binaryStr);
}

function base64UrlPadToBase64(base64UrlPadStr: string): string {
  return (
    base64UrlPadStr.replace('-', '+').replace('_', '/') +
    '='.repeat((4 - (base64UrlPadStr.length % 4)) % 4)
  );
}

function base64ToBase64UrlPad(base64Str: string): string {
  return base64Str.replace('+', '-').replace('/', '_').replace(/=+$/, '');
}

export function uint8arrayFromString(
  str: string,
  encoding = 'utf8'
): Uint8Array {
  switch (encoding) {
    case 'utf8':
      return utf8Encode(str);
    case 'base16':
      const arr = [];
      for (let i = 0; i < str.length; i += 2) {
        arr.push(parseInt(str.slice(i, i + 2), 16));
      }
      return new Uint8Array(arr);
    case 'base64':
      return base64ToUint8Array(str);
    case 'base64urlpad':
    case 'base64url':
      return base64ToUint8Array(base64UrlPadToBase64(str));
    default:
      throw new Error(`Unsupported encoding "${encoding}"`);
  }
}

export function uint8arrayToString(
  uint8array: Uint8Array,
  encoding = 'utf8'
): string {
  let _uint8array = new Uint8Array(uint8array);

  switch (encoding) {
    case 'utf8':
      return utf8Decode(_uint8array);
    case 'base16':
      return Array.from(_uint8array)
        .map((byte: number) => byte.toString(16).padStart(2, '0'))
        .join('');
    case 'base64':
      return uint8ArrayToBase64(_uint8array);
    case 'base64urlpad':
    case 'base64url':
      return base64ToBase64UrlPad(uint8ArrayToBase64(_uint8array));
    default:
      throw new Error(`Unsupported encoding "${encoding}"`);
  }
}
