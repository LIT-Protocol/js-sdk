import fs from 'fs/promises';

// CONFIGURATIONS
const FILE_NAME = 'artillery-state.json';

// State Object
const StateObject = {
  masterAccount: {
    // privateKey: undefined as string | `0x${string}` | undefined,
    // address: undefined as string | `0x${string}` | undefined,
    authData: undefined as any | undefined, // Changed from string to any since authData is an object
    pkp: undefined as any | undefined,
  },
};

// STATE - derived from StateObject to ensure type consistency
type State = typeof StateObject;

// read the file if it exists, if not throw an error
export const readFile = async (): Promise<State> => {
  async function _readFile() {
    const file = await fs.readFile(FILE_NAME, 'utf8');
    const content = JSON.parse(file) as State;

    // If content is empty object, write base state
    if (Object.keys(content).length === 0) {
      await fs.writeFile(FILE_NAME, JSON.stringify(StateObject, null, 2));
      return StateObject;
    }

    return content;
  }

  try {
    return await _readFile();
  } catch (error) {
    console.log('🚨 Failed to read file, creating new file...');
    await createFile();
    return await _readFile();
  }
};

// create the file if it doesn't exist
export const createFile = async () => {
  await fs.writeFile(FILE_NAME, JSON.stringify(StateObject, null, 2));
};

// Type-safe field paths - dynamically derived from State type
type StatePaths = {
  [K in keyof State]: K extends string
    ? State[K] extends object
      ?
          | {
              [P in keyof State[K]]: P extends string ? `${K}.${P}` : never;
            }[keyof State[K]]
          | K // Include both nested paths AND top-level key
      : K
    : never;
}[keyof State];

// Helper type to get nested property type
type GetNestedType<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends keyof T[K]
      ? T[K][Rest]
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

// Map paths to their corresponding types
type StatePathValue<T extends StatePaths> = GetNestedType<State, T>;

/**
 * Updates a specific field in the state with type safety
 * @param path - The dot-notation path to the field to update
 * @param value - The value to set, must match the field's type
 */
export const updateField = async <T extends StatePaths>(
  path: T,
  value: StatePathValue<T>
): Promise<void> => {
  const state = await readFile();

  // Split the path and navigate to the nested property
  const pathParts = path.split('.') as [keyof State, string];
  const [rootKey, nestedKey] = pathParts;

  if (
    rootKey in state &&
    typeof state[rootKey] === 'object' &&
    state[rootKey] !== null
  ) {
    (state[rootKey] as any)[nestedKey] = value;
    await fs.writeFile(FILE_NAME, JSON.stringify(state, null, 2));
  } else {
    throw new Error(`Invalid path: ${path}`);
  }
};

/**
 * Gets a field value, or updates it if it doesn't exist (is undefined/null/empty string)
 * @param path - The dot-notation path to the field to get/update (or top-level key)
 * @param defaultValue - The value to set if the current value is undefined/null/empty
 * @returns The existing value or the newly set default value
 */
export const getOrUpdate = async <T extends StatePaths>(
  path: T,
  defaultValue: NonNullable<StatePathValue<T>>
): Promise<NonNullable<StatePathValue<T>>> => {
  const state = await readFile();

  // Check if it's a top-level property or nested property
  if (!path.includes('.')) {
    // Top-level property
    const currentValue = (state as any)[path];

    // If value exists and is not null/undefined/empty string, return it
    if (currentValue != null && currentValue !== '') {
      return currentValue as NonNullable<StatePathValue<T>>;
    }

    // Otherwise, update with default value and return it
    (state as any)[path] = defaultValue;
    await fs.writeFile(FILE_NAME, JSON.stringify(state, null, 2));
    return defaultValue;
  } else {
    // Nested property
    const pathParts = path.split('.') as [keyof State, string];
    const [rootKey, nestedKey] = pathParts;

    if (
      rootKey in state &&
      typeof state[rootKey] === 'object' &&
      state[rootKey] !== null
    ) {
      const currentValue = (state[rootKey] as any)[nestedKey];

      // If value exists and is not null/undefined/empty string, return it
      if (currentValue != null && currentValue !== '') {
        return currentValue as NonNullable<StatePathValue<T>>;
      }

      // Otherwise, update with default value and return it
      (state[rootKey] as any)[nestedKey] = defaultValue;
      await fs.writeFile(FILE_NAME, JSON.stringify(state, null, 2));
      return defaultValue;
    } else {
      throw new Error(`Invalid path: ${path}`);
    }
  }
};
