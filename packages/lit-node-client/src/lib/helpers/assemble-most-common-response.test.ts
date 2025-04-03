import { assembleMostCommonResponse } from './assemble-most-common-response';

describe('assembleMostCommonResponse', () => {
  it('should return an empty object when given an empty array', () => {
    const responses: object[] = [];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({});
  });

  it('should return the correct most common values for simple objects', () => {
    const responses = [
      { color: 'red', size: 'large' },
      { color: 'blue', size: 'medium' },
      { color: 'red', size: 'large' },
      { color: 'red', size: 'small' },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ color: 'red', size: 'large' });
  });

  it('should handle objects with different keys', () => {
    const responses = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', city: 'New York' },
      { name: 'Alice', city: 'Los Angeles' },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ name: 'Alice', age: 30, city: 'Los Angeles' });
  });

  it('should handle nested objects correctly', () => {
    const responses = [
      {
        address: { city: 'New York', country: 'USA' },
        status: 'active',
      },
      {
        address: { city: 'Los Angeles', country: 'USA' },
        status: 'inactive',
      },
      {
        address: { city: 'New York', country: 'Canada' },
        status: 'active',
      },
      {
        address: { city: 'New York', country: 'USA' },
        status: 'active',
      },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({
      address: { city: 'New York', country: 'USA' },
      status: 'active',
    });
  });

  it('should handle undefined and empty string values', () => {
    const responses = [
      { name: 'Alice', value: undefined },
      { name: 'Bob', value: 'test' },
      { name: 'Alice', value: '' },
      { name: 'Alice', value: 'test' },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ name: 'Alice', value: 'test' });
  });

  it('should handle undefined and empty string values in nested object', () => {
    const responses = [
      { person: { name: 'Alice', value: undefined } },
      { person: { name: 'Bob', value: 'test' } },
      { person: { name: 'Alice', value: '' } },
      { person: { name: 'Alice', value: 'test' } },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ person: { name: 'Alice', value: 'test' } });
  });

  it('should return undefined if all values are undefined or empty string', () => {
    const responses = [
      { name: 'Alice', value: undefined },
      { name: 'Bob', value: '' },
      { name: 'Alice', value: undefined },
      { name: 'Alice', value: '' },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ name: 'Alice', value: undefined });
  });

  it('should handle nested object with different depth', () => {
    const responses = [
      { data: { level1: { level2: 'value1' } } },
      { data: { level1: 'value2' } },
      { data: { level1: { level2: 'value1' } } },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ data: { level1: { level2: 'value1' } } });
  });

  it('should handle arrays of different types', () => {
    const responses = [
      { name: 'Alice', tags: ['tag1', 'tag2'] },
      { name: 'Bob', tags: ['tag2', 'tag3'] },
      { name: 'Alice', tags: ['tag1', 'tag2'] },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ name: 'Alice', tags: ['tag1', 'tag2'] });
  });
  it('should handle arrays with mixed value types', () => {
    const responses = [
      {
        name: 'Alice',
        value: 10,
        other: true,
        values: [1, 2, '3'],
      },
      {
        name: 'Bob',
        value: 10,
        other: false,
        values: [2, 3, '4'],
      },
      {
        name: 'Alice',
        value: 10,
        other: true,
        values: [1, 2, '3'],
      },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({
      name: 'Alice',
      value: 10,
      other: true,
      values: [1, 2, '3'],
    });
  });

  it('should handle ties by choosing the last encountered value', () => {
    const responses = [
      { color: 'red', size: 'small' },
      { color: 'blue', size: 'large' },
      { color: 'red', size: 'large' },
      { color: 'blue', size: 'small' },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ color: 'blue', size: 'small' });
  });
  it('should handle ties in nested objects by choosing the last encountered value', () => {
    const responses = [
      { data: { color: 'red', size: 'small' } },
      { data: { color: 'blue', size: 'large' } },
      { data: { color: 'red', size: 'large' } },
      { data: { color: 'blue', size: 'small' } },
    ];
    const result = assembleMostCommonResponse(responses);
    expect(result).toEqual({ data: { color: 'blue', size: 'small' } });
  });
});
