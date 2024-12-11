import { MachineContext } from './machine-context';

const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

describe('MachineContext', () => {
  let context: MachineContext;
  const initialContext = {
    contracts: {
      token: '0x123...',
    },
    values: {
      amount: 100
    },
    existingArray: [1, 2, 3]
  };

  beforeEach(() => {
    context = new MachineContext(deepCopy(initialContext));
  });

  it('should initialize with provided context', () => {
    expect(context.get()).toEqual(initialContext);
  });

  it('should initialize empty when no context provided', () => {
    const emptyContext = new MachineContext();
    expect(emptyContext.get()).toEqual({});
  });

  it('should get context values using dot notation', () => {
    expect(context.get('contracts.token')).toBe('0x123...');
    expect(context.get('values.amount')).toBe(100);
  });

  it('should get context values using array notation', () => {
    expect(context.get(['contracts', 'token'])).toBe('0x123...');
    expect(context.get(['values', 'amount'])).toBe(100);
  });

  it('should set context values using dot notation', () => {
    context.set('new.value', 42);
    expect(context.get('new.value')).toBe(42);
  });

  it('should set context values using array notation', () => {
    context.set(['deeply', 'nested', 'value'], 'test');
    expect(context.get('deeply.nested.value')).toBe('test');
  });

  it('should handle missing context paths gracefully', () => {
    expect(context.get('non.existent.path')).toBeUndefined();
  });

  it('should create intermediate objects when setting deep paths', () => {
    context.set('a.b.c', 'value');
    expect(context.get()).toEqual(expect.objectContaining({
      a: {
        b: {
          c: 'value'
        }
      }
    }));
  });

  it('should override existing values', () => {
    context.set('contracts.token', '0xnew...');
    expect(context.get('contracts.token')).toBe('0xnew...');
  });

  it('should create new array when path does not exist', () => {
    context.push('newArray', 1);
    expect(context.get('newArray')).toEqual([1]);
  });

  it('should push to existing array', () => {
    context.push('existingArray', 4);
    expect(context.get('existingArray')).toEqual([1, 2, 3, 4]);
  });

  it('should convert non-array value to array when pushing', () => {
    context.push('contracts.token', '0xnew...');
    expect(context.get('contracts.token')).toEqual(['0x123...', '0xnew...']);
  });

  it('should work with array notation', () => {
    context.push(['deeply', 'nested', 'array'], 'value');
    expect(context.get('deeply.nested.array')).toEqual(['value']);
  });

  it('should maintain array reference when pushing', () => {
    const before = context.get('existingArray');
    context.push('existingArray', 4);
    const after = context.get('existingArray');
    expect(before).toBe(after); // Same array reference
  });

  it('should handle pushing multiple values', () => {
    context.push('newArray', 1);
    context.push('newArray', 2);
    context.push('newArray', 3);
    expect(context.get('newArray')).toEqual([1, 2, 3]);
  });

  it('should handle pushing to nested paths', () => {
    context.push('nested.path.to.array', 'first');
    context.push('nested.path.to.array', 'second');
    expect(context.get('nested.path.to.array')).toEqual(['first', 'second']);
  });

  it('should convert non-array values in nested paths', () => {
    context.set('deep.nested.value', 'original');
    context.push('deep.nested.value', 'new');
    expect(context.get('deep.nested.value')).toEqual(['original', 'new']);
  });

  describe('array indexing', () => {
    beforeEach(() => {
      context = new MachineContext(deepCopy({
        simple: ['a', 'b', 'c'],
        complex: [
          { id: 1, value: { foo: 'bar' } },
          { id: 2, value: { foo: 'baz' } }
        ],
        nested: {
          arrays: [
            [1, 2],
            [3, 4]
          ]
        }
      }));
    });

    it('should access array elements using index notation', () => {
      expect(context.get('simple[1]')).toBe('b');
      expect(context.get('complex[0].id')).toBe(1);
      expect(context.get('complex[0].value.foo')).toBe('bar');
    });

    it('should access nested array elements', () => {
      expect(context.get('nested.arrays[1][0]')).toBe(3);
    });

    it('should set array elements using index notation', () => {
      context.set('simple[1]', 'x');
      expect(context.get('simple')).toEqual(['a', 'x', 'c']);
    });

    it('should set nested array elements', () => {
      context.set('complex[1].value.foo', 'qux');
      expect(context.get('complex[1].value.foo')).toBe('qux');
    });

    it('should create arrays when setting with index notation', () => {
      context.set('new[2].foo', 'bar');
      expect(context.get('new')).toEqual([undefined, undefined, { foo: 'bar' }]);
    });

    it('should handle array notation with dot notation mixed', () => {
      context.set('mixed.array[0].nested.value[1]', 42);
      expect(context.get('mixed.array[0].nested.value[1]')).toBe(42);
    });

    it('should work with array paths', () => {
      expect(context.get(['complex', '0', 'value', 'foo'])).toBe('bar');
    });

    it('should push to arrays accessed via index notation', () => {
      context.push('nested.arrays[0]', 3);
      expect(context.get('nested.arrays[0]')).toEqual([1, 2, 3]);
    });

    it('should handle out of bounds indices by filling with empty objects', () => {
      context.set('sparse[5].value', 'test');
      expect((context.get('sparse') as any[]).length).toBe(6);
      expect(context.get('sparse[5].value')).toBe('test');
    });
  });
});
