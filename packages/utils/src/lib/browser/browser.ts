import {
    fromString as uint8arrayFromStringFromLib,
    toString as uint8arrayToStringFromLib,
} from 'uint8arrays';
import { SupportedEncodings } from 'uint8arrays/util/bases';

/**
 * 
 * (Helper)
 * Convert a Uint8Array to a string.  Supports various encodings.
 * This is a re-export of https://www.npmjs.com/package/uint8arrays and you can
 * find the list of supported encodings here https://github.com/multiformats/multibase/blob/master/multibase.csv
 *
 * @param { Uint8Array } uint8array The Uint8Array to convert to a string
 * @param { SupportedEncodings } encoding The encoding to use when converting the Uint8Array to a string.
 * @returns { string } The string representation of the Uint8Array
 */
export const uint8arrayToString = (
    uint8array: Uint8Array,
    encoding: SupportedEncodings
): string => {
    return uint8arrayToStringFromLib(uint8array, encoding);
};

/**
 * 
 * (Helper)
 * Convert a string to a Uint8Array.  Supports various encodings.
 * This is a re-export of https://www.npmjs.com/package/uint8arrays and you can
 * find the list of supported encodings here https://github.com/multiformats/multibase/blob/master/multibase.csv
 *
 * @param { string } str The string to convert to a Uint8Array
 * @param { SupportedEncodings } encoding The encoding to use when converting the string to a Uint8Array.
 * @returns { Uint8Array } The Uint8Array representation of the data from the string
 */
export const uint8arrayFromString = (
    str: string,
    encoding: SupportedEncodings
): Uint8Array => {
    return uint8arrayFromStringFromLib(str, encoding);
};

/**
 * 
 * Convert a Blob to a base64urlpad string.  Note: This function returns a promise.
 *
 * @param { Blob | File } blob The Blob or File to turn into a base64 string
 * @returns { Promise<string> } A promise that resolves to the base64 string
 */
export const blobToBase64String = async (
    blob: Blob | File
): Promise<string> => {
    const arrayBuffer = await blob.arrayBuffer();

    const uint8array = new Uint8Array(arrayBuffer);

    return uint8arrayToString(uint8array, 'base64urlpad');
};

/**
 * 
 * Convert a base64urlpad string to a Blob.
 * Note: This function DOES NOT return a promise
 *
 * @param { string } base64String The base64 string that to turn into a Blob
 * @returns { Blob }  A blob that contains the decoded base64 data
 */
export const base64StringToBlob = (base64String: string): Blob => {
    return new Blob([uint8arrayFromString(base64String, 'base64urlpad')]);
};

/**
 * 
 * // TEST: fileToDataUrl
 * Convert a file to a data URL, which could then be embedded in a LIT.
 * A data URL is a string representation of a file.
 *
 * @param { File } file The file to turn into a data url
 * @returns { string } The data URL.  This is a string representation that can be used anywhere the original file would be used.
 */
export const fileToDataUrl = (
    file: File
): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(file);
    });
};

/**
 * 
 * // TEST: downloadFile
 * Download a file in memory to the user's computer
 *
 * @param { Object } params
 * @property { string } filename The name of the file
 * @property { Uint8Array } data The actual file itself as a Uint8Array
 * @property { string } mimetype The mime type of the file
 *
 * @returns { void } The data URL.  This is a string representation that can be used anywhere the original file would be used.
 *
 */
export const downloadFile = ({
    fileName,
    data,
    mimeType,
}: {
    fileName: string;
    data: Uint8Array;
    mimeType: string;
}): void => {
    const element = document.createElement('a');

    element.setAttribute(
        'href',
        'data:' + mimeType + ';base64,' + uint8arrayToString(data, 'base64')
    );
    element.setAttribute('download', fileName);

    element.style.display = 'none';

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

/**
 * 
 * // TEST: injectViewerIFrame
 * Inject an iFrame into the current page that will display a LIT.
 * This function safely sandboxes the content in the iFrame so that the LIT cannot see cookies or localStorage of the parent website.
 *
 * @param { Object } params
 * @property { string } destinationId The DOM ID of the element to inject the iFrame into
 * @property { string } title The title of the content being displayed
 * @property { string } fileUrl The URL of the content that will be shown in the iFrame
 * @property { string } className An optional DOM class name to add to the iFrame for styling
 *
 * @returns { void }
 */
export const injectViewerIFrame = ({
    destinationId,
    title,
    fileUrl,
    className,
}: {
    destinationId: string;
    title: string;
    fileUrl: string;
    className: string;
}): void => {
    if (fileUrl.includes('data:')) {
        // data urls are not safe, refuse to do this
        throw new Error(
            'You can not inject an iFrame with a data url.  Try a regular https URL.'
        );
    }

    const url = new URL(fileUrl);
    if (url.host.toLowerCase() === window.location.host.toLowerCase()) {
        throw new Error(
            'You cannot host a LIT on the same domain as the parent webpage.  This is because iFrames with the same origin have access to localstorage and cookies in the parent webpage which is unsafe'
        );
    }

    const iframe = Object.assign(document.createElement('iframe'), {
        src: fileUrl,
        title: title,
        sandbox:
            'allow-forms allow-scripts allow-popups  allow-modals allow-popups-to-escape-sandbox allow-same-origin',
        loading: 'lazy',
        allow: 'accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr; screen-wake-lock; web-share; xr-spatial-tracking',
    });

    if (className) {
        iframe.className = className;
    }

    document.getElementById(destinationId)?.appendChild(iframe);
};
