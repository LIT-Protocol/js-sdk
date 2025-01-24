import { LIT_ABILITY } from '@lit-protocol/constants';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPaymentDelegationResource,
  LitPKPResource,
} from '../resources';
import { ResourceAbilityRequestBuilder } from './resource-builder';

describe('ResourceAbilityRequestBuilder', () => {
  let builder: ResourceAbilityRequestBuilder;

  beforeEach(() => {
    builder = new ResourceAbilityRequestBuilder();
  });

  it('should build an array of resource ability requests', () => {
    const resourceId1 = '123';
    const resourceId2 = '456';
    builder
      .addPKPSigningRequest(resourceId1)
      .addLitActionExecutionRequest(resourceId2);

    const requests = builder.build();
    expect(JSON.stringify(requests)).toBe(
      JSON.stringify([
        {
          resource: new LitPKPResource('123'),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource('456'),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ])
    );
  });

  it('should build an array of resource ability requests with all types', () => {
    builder
      .addPKPSigningRequest('123') // PKP Signing
      .addLitActionExecutionRequest('456') // Lit Action Execution
      .addAccessControlConditionSigningRequest('789') // ACC Signing
      .addAccessControlConditionDecryptionRequest('abc') // ACC Decryption
      .addPaymentDelegationRequest('def'); // Payment Delegation

    const requests = builder.build();
    expect(JSON.stringify(requests)).toBe(
      JSON.stringify([
        {
          resource: new LitPKPResource('123'),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource('456'),
          ability: LIT_ABILITY.LitActionExecution,
        },
        {
          resource: new LitAccessControlConditionResource('789'),
          ability: LIT_ABILITY.AccessControlConditionSigning,
        },
        {
          resource: new LitAccessControlConditionResource('abc'),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
        {
          resource: new LitPaymentDelegationResource('def'),
          ability: LIT_ABILITY.PaymentDelegation,
        },
      ])
    );
  });
});
