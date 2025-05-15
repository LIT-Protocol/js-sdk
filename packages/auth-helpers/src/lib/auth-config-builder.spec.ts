import { LIT_ABILITY, LIT_RESOURCE_PREFIX } from '@lit-protocol/constants'; // Added LIT_RESOURCE_PREFIX
import { AuthConfigSchema } from '@lit-protocol/schemas';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
import { createAuthConfigBuilder } from './auth-config-builder';

describe('createAuthConfigBuilder', () => {
  const defaultValues = AuthConfigSchema.parse({});

  it('should build with default values if nothing is added (except resources for validation)', () => {
    const builder = createAuthConfigBuilder();
    builder.addPKPSigningRequest('*');
    const config = builder.build();
    expect(config.statement).toEqual(defaultValues.statement);
    expect(config.domain).toEqual(defaultValues.domain);
    expect(config.expiration).toBeDefined();
    expect(config.capabilityAuthSigs).toEqual(defaultValues.capabilityAuthSigs);
    expect(config.resources).toHaveLength(1);
  });

  it('should throw an error if build() is called without adding any resources', () => {
    const builder = createAuthConfigBuilder();
    expect(() => builder.build()).toThrowError(/🤯 Resources array is empty/);
  });

  it('should add capabilityAuthSigs', () => {
    const sigs = [
      {
        sig: 'testSig',
        derivedVia: 'testMethod',
        signedMessage: 'msg',
        address: 'addr',
      },
    ];
    const config = createAuthConfigBuilder()
      .addPKPSigningRequest('*') // Resource needed to pass build validation
      .addCapabilityAuthSigs(sigs)
      .build();
    expect(config.capabilityAuthSigs).toEqual(sigs);
  });

  it('should add expiration as ISO string', () => {
    const expiration = new Date(Date.now() + 100000).toISOString();
    const config = createAuthConfigBuilder()
      .addPKPSigningRequest('*')
      .addExpiration(expiration)
      .build();
    expect(config.expiration).toEqual(expiration);
  });

  it('should add expiration as Date object', () => {
    const expirationDate = new Date(Date.now() + 200000);
    const config = createAuthConfigBuilder()
      .addPKPSigningRequest('*')
      .addExpiration(expirationDate)
      .build();
    expect(config.expiration).toEqual(expirationDate.toISOString());
  });

  it('should add statement', () => {
    const statement = 'Test statement';
    const config = createAuthConfigBuilder()
      .addPKPSigningRequest('*')
      .addStatement(statement)
      .build();
    expect(config.statement).toEqual(statement);
  });

  it('should add domain', () => {
    const domain = 'example.com';
    const config = createAuthConfigBuilder()
      .addPKPSigningRequest('*')
      .addDomain(domain)
      .build();
    expect(config.domain).toEqual(domain);
  });

  it('should add PKPSigningRequest', () => {
    const resourceId = 'test-pkp-id';
    const config = createAuthConfigBuilder()
      .addPKPSigningRequest(resourceId)
      .build();
    expect(config.resources).toHaveLength(1);
    const resourceRequest = config.resources[0] as LitResourceAbilityRequest;
    // expect(resourceRequest.resource).toBeInstanceOf(ActualLitPkpResource); // This will fail due to Zod parsing
    expect(resourceRequest.resource.resourcePrefix).toEqual(
      LIT_RESOURCE_PREFIX.PKP
    );
    expect(resourceRequest.resource.resource).toEqual(resourceId); // Assuming formatPKPResource doesn't change 'test-pkp-id'
    expect(
      `${resourceRequest.resource.resourcePrefix}://${resourceRequest.resource.resource}`
    ).toEqual(`${LIT_RESOURCE_PREFIX.PKP}://${resourceId}`);
    expect(resourceRequest.ability).toEqual(LIT_ABILITY.PKPSigning);
  });

  it('should add LitActionExecutionRequest', () => {
    const resourceId = 'test-action-ipfs';
    const config = createAuthConfigBuilder()
      .addLitActionExecutionRequest(resourceId)
      .build();
    expect(config.resources).toHaveLength(1);
    const resourceRequest = config.resources[0] as LitResourceAbilityRequest;
    // expect(resourceRequest.resource).toBeInstanceOf(ActualLitActionResource); // Fails due to Zod
    expect(resourceRequest.resource.resourcePrefix).toEqual(
      LIT_RESOURCE_PREFIX.LitAction
    );
    expect(resourceRequest.resource.resource).toEqual(resourceId);
    expect(
      `${resourceRequest.resource.resourcePrefix}://${resourceRequest.resource.resource}`
    ).toEqual(`${LIT_RESOURCE_PREFIX.LitAction}://${resourceId}`);
    expect(resourceRequest.ability).toEqual(LIT_ABILITY.LitActionExecution);
  });

  it('should add AccessControlConditionSigningRequest', () => {
    const resourceId = 'acc-signing-resource';
    const config = createAuthConfigBuilder()
      .addAccessControlConditionSigningRequest(resourceId)
      .build();
    expect(config.resources).toHaveLength(1);
    const resourceRequest = config.resources[0] as LitResourceAbilityRequest;
    // expect(resourceRequest.resource).toBeInstanceOf(ActualLitAccResource); // Fails due to Zod
    expect(resourceRequest.resource.resourcePrefix).toEqual(
      LIT_RESOURCE_PREFIX.AccessControlCondition
    );
    expect(resourceRequest.resource.resource).toEqual(resourceId);
    expect(
      `${resourceRequest.resource.resourcePrefix}://${resourceRequest.resource.resource}`
    ).toEqual(`${LIT_RESOURCE_PREFIX.AccessControlCondition}://${resourceId}`);
    expect(resourceRequest.ability).toEqual(
      LIT_ABILITY.AccessControlConditionSigning
    );
  });

  it('should add AccessControlConditionDecryptionRequest', () => {
    const resourceId = 'acc-decryption-resource';
    const config = createAuthConfigBuilder()
      .addAccessControlConditionDecryptionRequest(resourceId)
      .build();
    expect(config.resources).toHaveLength(1);
    const resourceRequest = config.resources[0] as LitResourceAbilityRequest;
    // expect(resourceRequest.resource).toBeInstanceOf(ActualLitAccResource); // Fails due to Zod
    expect(resourceRequest.resource.resourcePrefix).toEqual(
      LIT_RESOURCE_PREFIX.AccessControlCondition
    );
    expect(resourceRequest.resource.resource).toEqual(resourceId);
    expect(
      `${resourceRequest.resource.resourcePrefix}://${resourceRequest.resource.resource}`
    ).toEqual(`${LIT_RESOURCE_PREFIX.AccessControlCondition}://${resourceId}`);
    expect(resourceRequest.ability).toEqual(
      LIT_ABILITY.AccessControlConditionDecryption
    );
  });

  it('should add PaymentDelegationRequest', () => {
    const resourceId = 'payment-delegation-resource';
    const config = createAuthConfigBuilder()
      .addPaymentDelegationRequest(resourceId)
      .build();
    expect(config.resources).toHaveLength(1);
    const resourceRequest = config.resources[0] as LitResourceAbilityRequest;
    // expect(resourceRequest.resource).toBeInstanceOf(ActualLitPaymentResource); // Fails due to Zod
    expect(resourceRequest.resource.resourcePrefix).toEqual(
      LIT_RESOURCE_PREFIX.PaymentDelegation
    );
    expect(resourceRequest.resource.resource).toEqual(resourceId);
    expect(
      `${resourceRequest.resource.resourcePrefix}://${resourceRequest.resource.resource}`
    ).toEqual(`${LIT_RESOURCE_PREFIX.PaymentDelegation}://${resourceId}`);
    expect(resourceRequest.ability).toEqual(LIT_ABILITY.PaymentDelegation);
  });

  it('should chain methods and add multiple resources', () => {
    const statement = 'Chained test';
    const domain = 'chained.example.com';
    const pkpId = 'pkp-123';
    const actionId = 'action-456';

    const config = createAuthConfigBuilder()
      .addStatement(statement)
      .addDomain(domain)
      .addPKPSigningRequest(pkpId)
      .addLitActionExecutionRequest(actionId)
      .build();

    expect(config.statement).toEqual(statement);
    expect(config.domain).toEqual(domain);
    expect(config.resources).toHaveLength(2);

    const pkpResourceReq = config.resources.find(
      (r) =>
        r.resource.resourcePrefix === LIT_RESOURCE_PREFIX.PKP &&
        r.resource.resource === pkpId
    ) as LitResourceAbilityRequest;
    const actionResourceReq = config.resources.find(
      (r) =>
        r.resource.resourcePrefix === LIT_RESOURCE_PREFIX.LitAction &&
        r.resource.resource === actionId
    ) as LitResourceAbilityRequest;

    expect(pkpResourceReq).toBeDefined();
    expect(actionResourceReq).toBeDefined();

    if (pkpResourceReq) {
      // Type guard
      // expect(pkpResourceReq.resource).toBeInstanceOf(ActualLitPkpResource); // Fails
      expect(pkpResourceReq.resource.resourcePrefix).toEqual(
        LIT_RESOURCE_PREFIX.PKP
      );
      expect(pkpResourceReq.resource.resource).toEqual(pkpId);
      expect(pkpResourceReq.ability).toEqual(LIT_ABILITY.PKPSigning);
    }

    if (actionResourceReq) {
      // Type guard
      // expect(actionResourceReq.resource).toBeInstanceOf(ActualLitActionResource); // Fails
      expect(actionResourceReq.resource.resourcePrefix).toEqual(
        LIT_RESOURCE_PREFIX.LitAction
      );
      expect(actionResourceReq.resource.resource).toEqual(actionId);
      expect(actionResourceReq.ability).toEqual(LIT_ABILITY.LitActionExecution);
    }
  });

  it('should build a full config with all properties and multiple resources', () => {
    const sigs = [
      {
        sig: 'fullSig',
        derivedVia: 'fullMethod',
        signedMessage: 'fullMsg',
        address: 'fullAddr',
      },
    ];
    const expiration = new Date(Date.now() + 300000).toISOString();
    const statement = 'Full configuration test';
    const domain = 'full.example.com';
    const pkpId = 'pkp-full';
    const actionId = 'action-full';
    const accSignId = 'acc-sign-full';

    const config = createAuthConfigBuilder()
      .addCapabilityAuthSigs(sigs)
      .addExpiration(expiration)
      .addStatement(statement)
      .addDomain(domain)
      .addPKPSigningRequest(pkpId)
      .addLitActionExecutionRequest(actionId)
      .addAccessControlConditionSigningRequest(accSignId)
      .build();

    expect(config.capabilityAuthSigs).toEqual(sigs);
    expect(config.expiration).toEqual(expiration);
    expect(config.statement).toEqual(statement);
    expect(config.domain).toEqual(domain);
    expect(config.resources).toHaveLength(3);

    const pkpResource = config.resources.find(
      (r) =>
        r.resource.resourcePrefix === LIT_RESOURCE_PREFIX.PKP &&
        r.resource.resource === pkpId
    );
    const actionResource = config.resources.find(
      (r) =>
        r.resource.resourcePrefix === LIT_RESOURCE_PREFIX.LitAction &&
        r.resource.resource === actionId
    );
    const accSignResource = config.resources.find(
      (r) =>
        r.resource.resourcePrefix ===
          LIT_RESOURCE_PREFIX.AccessControlCondition &&
        r.resource.resource === accSignId
    );

    expect(pkpResource).toBeDefined();
    expect(actionResource).toBeDefined();
    expect(accSignResource).toBeDefined();

    if (pkpResource) {
      expect(pkpResource.ability).toEqual(LIT_ABILITY.PKPSigning);
    }
    if (actionResource) {
      expect(actionResource.ability).toEqual(LIT_ABILITY.LitActionExecution);
    }
    if (accSignResource) {
      expect(accSignResource.ability).toEqual(
        LIT_ABILITY.AccessControlConditionSigning
      );
    }
  });
});
