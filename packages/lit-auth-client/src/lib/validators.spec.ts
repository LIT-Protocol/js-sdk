import { validateMintRequestBody } from './validators';

describe('validateMintRequestBody', () => {
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should pass validation when all fields are correct and present', () => {
    const customArgs = {
      keyType: 2,
      permittedAuthMethodTypes: [1],
      permittedAuthMethodIds: ['id123'],
      permittedAuthMethodPubkeys: ['pubkey123'],
      permittedAuthMethodScopes: [[1]],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    };
    expect(validateMintRequestBody(customArgs)).toBe(true);
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should pass validation when no fields are provided', () => {
    const customArgs = {};
    expect(validateMintRequestBody(customArgs)).toBe(true);
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should pass validation when some fields are provided and correct', () => {
    const customArgs = {
      keyType: 2,
      permittedAuthMethodPubkeys: ['pubkey123'],
    };
    expect(validateMintRequestBody(customArgs)).toBe(true);
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should fail validation and log error for incorrect keyType', () => {
    const customArgs = {
      keyType: '2', // should be a number
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid type for keyType')
    );
  });

  it('should fail validation and log error for incorrect permittedAuthMethodTypes', () => {
    const customArgs = {
      permittedAuthMethodTypes: ['1'], // should be an array of numbers
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid type for permittedAuthMethodTypes')
    );
  });

  it('should fail validation and log error for incorrect permittedAuthMethodIds', () => {
    const customArgs = {
      permittedAuthMethodIds: [123], // should be an array of strings
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid type for permittedAuthMethodIds')
    );
  });

  it('should fail validation and log error for incorrect permittedAuthMethodPubkeys', () => {
    const customArgs = {
      permittedAuthMethodPubkeys: [123], // should be an array of strings
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid type for permittedAuthMethodPubkeys')
    );
  });
  it('should fail validation and log error for incorrect permittedAuthMethodScopes', () => {
    const customArgs = {
      permittedAuthMethodScopes: [[1]], // should be an array of ethers.BigNumber
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(true);
  });

  it('should fail validation and log error for incorrect addPkpEthAddressAsPermittedAddress', () => {
    const customArgs = {
      addPkpEthAddressAsPermittedAddress: 'true', // should be a boolean
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        'Invalid type for addPkpEthAddressAsPermittedAddress'
      )
    );
  });

  it('should fail validation and log error for incorrect sendPkpToItself', () => {
    const customArgs = {
      sendPkpToItself: 'true', // should be a boolean
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid type for sendPkpToItself')
    );
  });

  it('should fail validation and log error for extraneous keys', () => {
    const customArgs = {
      extraneousKey: 'unexpected', // This key is not defined in MintRequestBody
    };
    expect(validateMintRequestBody(customArgs as any)).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid key found: extraneousKey')
    );
  });
});
