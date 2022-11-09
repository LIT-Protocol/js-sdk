import * as blsSdk from '@litprotocol-dev/bls-sdk';
import * as ecdsaSdk from '@litprotocol-dev/ecdsa-sdk';

// check if an object's has items
const hasItems = (obj: any) => {
    const items = Object.keys(obj);

    const hasItems = obj && items.length > 0;
    return {
        hasItems,
        length: items.length,
        firstAndLastItems: [items[0], items[items.length - 1]],
    };
};

console.log("blsSdk:", hasItems(blsSdk));
console.log("ecdsaSdk:", hasItems(ecdsaSdk));