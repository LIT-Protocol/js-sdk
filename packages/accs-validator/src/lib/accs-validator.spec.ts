import { getSchema, SCHEMAS, validate } from './accs-validator';
import { mustMatchRequiredKeys } from './conditions/cond-must-match-required-keys';

describe('accsValidator', () => {
  it('should load all valid schemas', () => {
    // for each schema, check if it is loaded
    SCHEMAS.forEach(async (schema) => {
      const schemaJson = await schema;

      // each schema should contains $id, $schema, title, description, type, properties, and required
      expect(schemaJson.$id).toBeDefined();
      expect(schemaJson.$schema).toBeDefined();
      expect(schemaJson.title).toBeDefined();
      expect(schemaJson.description).toBeDefined();
      expect(schemaJson.type).toBeDefined();
      expect(schemaJson.properties).toBeDefined();
      expect(schemaJson.required).toBeDefined();
    });
  });
});

describe('EVM Basic', () => {
  it('should get correct schema for evm_basic 1', async () => {
    const accs = (await import('./cases/evm_basic')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_BASIC');
  });
  it("should get correct schema when there's an operator in the accs", async () => {
    const accs = (await import('./cases/operators')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_BASIC');
  });

  it("should get correct schema when it's a timelock", async () => {
    const accs = (await import('./cases/timelock')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_BASIC');
  });
  it('should get correct schema when parameters: [":domain"]', async () => {
    const accs = (await import('./cases/domain')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_BASIC');
  });
});

describe('EVM Contract', () => {
  it('should get correct schema for evm_contract 1', async () => {
    const accs = (await import('./cases/evm_contract')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_CONTRACT');
  });
  it('should get correct schema when returnValueTest value "true" is string', async () => {
    const accs = (await import('./cases/returnValueTrueIsString')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_CONTRACT');
  });
});

describe('SOL Contract', () => {
  it('should get correct schema for sol 1', async () => {
    const accs = (await import('./cases/sol_1')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_SOL');
  });
  it('should get correct schema for sol 2', async () => {
    const accs = (await import('./cases/sol_2')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_SOL');
  });
  it('should get correct schema for sol 3', async () => {
    const accs = (await import('./cases/sol_3')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_SOL');
  });
  it('should get correct schema for sol 4', async () => {
    const accs = (await import('./cases/sol_4')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_SOL');
  });
  it('should get correct schema for sol 5', async () => {
    const accs = (await import('./cases/sol_5')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_SOL');
  });
});

describe('COSMOS Contract', () => {
  it('should get correct schema for cosmos 1', async () => {
    const accs = (await import('./cases/kyve')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_ATOM');
  });
  it('should get correct schema for cosmos 2', async () => {
    const accs = (await import('./cases/cosmos_1')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_ATOM');
  });
  it('should get correct schema for cosmos 3', async () => {
    const accs = (await import('./cases/cosmos_2')).default;
    const schema = await getSchema(accs[0]);
    expect(schema.title).toBe('LPACC_EVM_ATOM');
  });
});

describe('Must match required keys', () => {
  it('should match required keys for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      standardContractType: 'ERC1155',
      chain: 'ethereum',
      method: 'balanceOf',
      parameters: [':userAddress', '9541'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('200');
  });
  it('should FAIL required key "returnValueTest" is missing for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      standardContractType: 'ERC1155',
      chain: 'ethereum',
      method: 'balanceOf',
      parameters: [':userAddress', '9541'],
      rXeturnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('500');
  });
  it('should FAIL required key "parameters" is missing for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      standardContractType: 'ERC1155',
      chain: 'ethereum',
      method: 'balanceOf',
      pXarameters: [':userAddress', '9541'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('500');
  });
  it('should FAIL required key "method" is missing for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      standardContractType: 'ERC1155',
      chain: 'ethereum',
      mXethod: 'balanceOf',
      parameters: [':userAddress', '9541'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('500');
  });
  it('should FAIL required key "chain" is missing for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      standardContractType: 'ERC1155',
      cXhain: 'ethereum',
      method: 'balanceOf',
      parameters: [':userAddress', '9541'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('500');
  });
  it('should FAIL required key "standardContractType" is missing for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      sXtandardContractType: 'ERC1155',
      chain: 'ethereum',
      method: 'balanceOf',
      parameters: [':userAddress', '9541'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('500');
  });
  it('should FAIL required key "contractAddress" is missing for evm_basic 1', async () => {
    const evmSchema = await SCHEMAS[0];

    const acc = {
      cXontractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
      standardContractType: 'ERC1155',
      chain: 'ethereum',
      method: 'balanceOf',
      parameters: [':userAddress', '9541'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    };

    const match = mustMatchRequiredKeys(acc as any, evmSchema.required);

    expect(JSON.stringify(match)).toContain('500');
  });
});

describe('EVM Basic Validate', () => {
  it('should validate schema for evm_basic 1', async () => {
    const accs = (await import('./cases/evm_basic')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_EVM_BASIC');
    expect(res.status).toBe(200);
  });
  it("should validate schema when there's an operator in the accs", async () => {
    const accs = (await import('./cases/operators')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_EVM_BASIC');
    expect(res.status).toBe(200)
  });

  it("should validate schema when it's a timelock", async () => {
    const accs = (await import('./cases/timelock')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_EVM_BASIC');
    expect(res.status).toBe(200)
  });
  it('should validate schema when parameters: [":domain"]', async () => {
    const accs = (await import('./cases/domain')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_EVM_BASIC');
    expect(res.status).toBe(200)
  });
});

describe('EVM Contract Validate', () => {
  it('should validate schema for evm_contract 1', async () => {
    const accs = (await import('./cases/evm_contract')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_EVM_CONTRACT');
    expect(res.status).toBe(200)
  });
  it('should validate schema when returnValueTest value "true" is string', async () => {
    const accs = (await import('./cases/returnValueTrueIsString')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_EVM_CONTRACT');
    expect(res.status).toBe(200)
  });
});

describe('SOL Validate', () => {
  it('should validate schema for sol 1', async () => {
    const accs = (await import('./cases/sol_1')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('LPACC_SOL');
    expect(res.status).toBe(200)
  });
  it('should FAIL to validate schema for sol 2', async () => {
    const accs = (await import('./cases/sol_2')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('missing.');
  });
  it('should FAIL to validate schema for sol 3', async () => {
    const accs = (await import('./cases/sol_3')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('missing.');
  });
  it('should FAIL to validate schema for sol 4', async () => {
    const accs = (await import('./cases/sol_4')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('missing.');
  });
  it('should FAIL to validate schema for sol 5', async () => {
    const accs = (await import('./cases/sol_5')).default;
    const res = await validate(accs);
    expect(JSON.stringify(res)).toContain('missing.');
  });
});
