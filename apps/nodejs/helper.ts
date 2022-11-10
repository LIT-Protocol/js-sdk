// check if an object's has items
export const hasItems = (obj: any) => {
    const items = Object.keys(obj);

    const hasItems = obj && items.length > 0;
    return {
        hasItems,
        length: items.length,
        firstAndLastItems: [items[0], items[items.length - 1]],
    };
};