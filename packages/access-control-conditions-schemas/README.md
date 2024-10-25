# Lit Protocol Access Control Condition definitions

The Lit Protocol Access Control Condition definitions are a set of Zod schemas that define the conditions that can be used to control access to a resource.

## Condition definition

A condition definition is a Zod schema that defines a condition that can be used to control access to a resource. More information can be found in the [Lit Protocol Access Control Condition definition specification](https://developer.litprotocol.com/v3/sdk/access-control/condition-types/unified-access-control-conditions)

## Condition types

The following condition types are defined:

- EVM Basic Conditions
- EVM Custom Contract Conditions
- Solana RPC Conditions
- Cosmos or Kyve Conditions

Each has its own Zod schema that defines their properties.

## Derived types

Each condition type has a derived type that can be used to type the condition object when using Typescript.
