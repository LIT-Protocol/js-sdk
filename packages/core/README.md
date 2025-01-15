# Core

This package provides foundational utilities and interfaces that power the core functionalities of the Lit Protocol SDK. It includes essential data structures, business logic, and shared configurations that other packages build upon.

## Installation

```bash
yarn add @lit-protocol/core
```

## Quick Start

```typescript
import { LitCore } from '@lit-protocol/core';

// Initialize core functionality
const litCore = new LitCore();

// Use core utilities
await litCore.connect();
```

## Key Features

- Core data structures and interfaces
- Shared configurations and constants
- Base classes for Lit Protocol functionality
- Essential utility functions
- Type definitions for core components

## Building

Run `nx build core` to build the library.

## Testing

Run `nx test core` to execute the unit tests via [Jest](https://jestjs.io).
