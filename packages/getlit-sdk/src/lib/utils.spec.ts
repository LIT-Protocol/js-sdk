// import { getContentMaterial } from './utils';

// describe('getContentMaterial', () => {
//   it('should convert string to Uint8Array', async () => {
//     const input = 'test';
//     const output = await getContentMaterial(input);
//     expect(ArrayBuffer.isView(output.data)).toBeTruthy();
//     expect(Array.from(output.data)).toEqual(
//       Array.from(new Uint8Array([116, 101, 115, 116]))
//     );
//     expect(output.type).toEqual('String');
//   });

//   it('should convert ArrayBuffer to Uint8Array', async () => {
//     const input = new ArrayBuffer(10);
//     const output = await getContentMaterial(input);
//     expect(ArrayBuffer.isView(output.data)).toBeTruthy();
//     expect(Array.from(output.data)).toEqual(Array.from(new Uint8Array(input)));
//     expect(output.type).toEqual('ArrayBuffer');
//   });

//   // it('should convert Blob to Uint8Array', async () => {
//   //   const blob = new Blob(['test'], { type: 'text/plain' });
//   //   const output = await getContentMaterial(blob);
//   //   expect(ArrayBuffer.isView(output.data)).toBeTruthy();
//   //   expect(output.type).toEqual('Blob');
//   // });

//   it('should return same Uint8Array', async () => {
//     const input = new Uint8Array([1, 2, 3, 4]);
//     const output = await getContentMaterial(input);
//     expect(ArrayBuffer.isView(output.data)).toBeTruthy();
//     expect(Array.from(output.data)).toEqual(Array.from(input));
//     expect(output.type).toEqual('Uint8Array');
//   });

//   it('should throw an error for null or undefined input', async () => {
//     await expect(getContentMaterial(null)).rejects.toThrow(
//       'Unsupported data type: object'
//     );
//     await expect(getContentMaterial(undefined)).rejects.toThrow(
//       'Unsupported data type: undefined'
//     );
//   });

//   it('should throw an error for unsupported data type', async () => {
//     const input = 123;
//     await expect(getContentMaterial(input)).rejects.toThrow(
//       'Unsupported data type: number'
//     );
//   });
// });
