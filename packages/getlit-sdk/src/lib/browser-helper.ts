import {
  getStoredEncryptedData,
  prepareExportableEncryptedData,
} from './utils';

export class BrowserHelper {
  // Usage:
  // const file = new Blob(['Hello, world!'], { type: 'text/plain' });
  // BrowserHelper.downloadFile(file);
  downloadFile(file: File | Blob, filename?: string) {
    // Create a URL for the file
    const url = URL.createObjectURL(file);

    // Create a link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? 'download'; // You can name the file whatever you want

    // Trigger the download by simulating a click
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Usage example with array of objects:
  // const data1 = [
  //   { name: 'John', age: 30 },
  //   { name: 'Jane', age: 25 }
  // ];
  // BrowserHelper.downloadAsFile(data1, 'people.csv');

  // // Usage example with a single object:
  // const data2 = { name: 'John', age: 30 };
  // BrowserHelper.downloadAsFile(data2, 'person.csv');

  // // Usage example with a string:
  // const data3 = 'This is a sample text file content.';
  // BrowserHelper.downloadAsFile(data3, 'sample.txt', 'text/plain');
  downloadAsFile(data: any, filename: string = 'download', type = 'text/csv') {
    let content;

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      // Convert the array of objects to a CSV string
      const keys = Object.keys(data[0]);
      content = [
        keys.join(','), // Headers
        ...data.map((obj) => keys.map((key) => obj[key]).join(',')), // Rows
      ].join('\n');
    } else if (typeof data === 'object') {
      // Convert a single object to a CSV string
      const keys = Object.keys(data);
      content = [
        keys.join(','), // Headers
        keys.map((key) => data[key]).join(','), // Row
      ].join('\n');
    } else if (typeof data === 'string') {
      // Use the string data directly
      content = data;
    } else {
      alert('Unsupported data type.');
      throw new Error('Unsupported data type.');
    }

    // Create a Blob object from the content
    const file = new Blob([content], { type });

    // Create a URL for the file
    const url = URL.createObjectURL(file);

    // Create a link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // File name provided as a parameter

    // Trigger the download by simulating a click
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return content;
  }

  downloadEncryptedData = async () => {
    const preparedExportableEncryptedData = prepareExportableEncryptedData();
    if (!preparedExportableEncryptedData) {
      throw new Error('No prepared exportable encrypted data found');
    }

    return this.downloadAsFile(
      preparedExportableEncryptedData,
      'lit-encrypted-data.csv'
    );
  };
}
