function parsePath(path?: string | string[]): string[] {
  if (!path) return [];

  if (Array.isArray(path)) return path;

  // Match either dot notation or array notation: foo.bar[0].baz or ['foo', 'bar', '0', 'baz']
  return path.split(/\.|\[|\]/).filter(Boolean);
}

function getFromObject(object: Record<string, any>, path?: string | string[]) {
  if (!path) return object;

  const parts = parsePath(path);
  return parts.reduce((obj, key) => {
    const index = parseInt(key);
    if (!isNaN(index) && Array.isArray(obj)) {
      return obj[index];
    }
    return obj?.[key];
  }, object);
}

export class MachineContext {
  private readonly context: Record<string, any> = {};

  constructor(initialContext?: Record<string, unknown>) {
    this.context = initialContext ?? {};
  }

  public get(path?: string | string[]): unknown {
    return getFromObject(this.context, path);
  }

  public set(path: string | string[], value: unknown = undefined): void {
    const parts = parsePath(path);

    let current = this.context;

    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];
      const isLast = i === parts.length - 1;

      const index = parseInt(key);

      if (!isNaN(index)) {
        if (Array.isArray(current)) {
          if (isLast) {
            current[index] = value;
          } else {
            current[index] =
              current[index] ?? (isNaN(parseInt(parts[i + 1])) ? {} : []);
            current = current[index];
          }
        } else {
          if (isLast) {
            current[key] = value;
          } else {
            current[key] =
              current[key] ?? (isNaN(parseInt(parts[i + 1])) ? {} : []);
            current = current[key];
          }
        }
      } else {
        if (isLast) {
          current[key] = value;
        } else {
          current = current[key] =
            current[key] ?? (isNaN(parseInt(parts[i + 1])) ? {} : []);
        }
      }
    }
  }

  public push(path: string | string[], value: unknown): void {
    const currentValue = this.get(path);

    if (currentValue === undefined) {
      this.set(path, [value]);
    } else if (Array.isArray(currentValue)) {
      currentValue.push(value);
    } else {
      this.set(path, [currentValue, value]);
    }
  }

  public setFromData(
    location: string | string[],
    data?: Record<string, any>,
    path?: string | string[]
  ) {
    if (!data) return;

    const value = getFromObject(data, path);
    this.set(location, value);
  }
}
