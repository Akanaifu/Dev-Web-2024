// Déclarations TypeScript pour Jest

declare global {
  const jest: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.MockedFunction<T>;
    spyOn: <T extends {}, M extends keyof T>(object: T, method: M) => jest.SpyInstance<T[M] extends (...args: any[]) => any ? ReturnType<T[M]> : any, T[M] extends (...args: any[]) => any ? Parameters<T[M]> : any[]>;
  };

  namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> {
      (...args: Parameters<T>): ReturnType<T>;
      mockReturnValue(value: ReturnType<T>): this;
      mockResolvedValue(value: ReturnType<T>): this;
      mockRejectedValue(value: any): this;
      mockImplementation(fn?: T): this;
      mockRestore(): void;
      mockClear(): void;
      mockReset(): void;
      toHaveBeenCalled(): void;
      toHaveBeenCalledWith(...args: Parameters<T>): void;
      toHaveBeenCalledTimes(times: number): void;
    }

    interface SpyInstance<TReturn = any, TArgs extends any[] = any[]> extends MockedFunction<(...args: TArgs) => TReturn> {
      mockRestore(): void;
    }

    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toContain(expected: any): R;
      toHaveLength(expected: number): R;
      toThrow(expected?: string | RegExp | Error): R;
      rejects: {
        toThrow(expected?: string | RegExp | Error): Promise<R>;
        toEqual(expected: any): Promise<R>;
      };
    }

    interface Expect {
      <T = any>(actual: T): Matchers<void>;
      any(constructor: any): any;
      anything(): any;
      extend(obj: any): void;
    }
  }

  const expect: jest.Expect;
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const fail: (message?: string) => never;

  interface Global {
    fetch: jest.MockedFunction<typeof fetch>;
    console: {
      log: jest.MockedFunction<typeof console.log>;
      error: jest.MockedFunction<typeof console.error>;
      warn: jest.MockedFunction<typeof console.warn>;
      info: jest.MockedFunction<typeof console.info>;
      debug: jest.MockedFunction<typeof console.debug>;
    };
  }
}

export {}; 