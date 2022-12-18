/**
    Acknowlegdements:
    - This `Result` implementation could be optimised to be faster and use less memory
    - Inheritance and abstract classes suck,
        interfaces and implementations are better,
        but in this case would require an undesireable amount of code repetition.
    - Exceptions suck,
        but is the best/only standard way of exitting cleanly,
        let's just hope no-one tries to catch them.
*/
export abstract class Result<T, E> {
    protected constructor() {}

    public abstract isOk(): boolean;
    public abstract isErr(): boolean;

    /** throws `InvalidResultUnwrap` if not `Ok`, not to be catched. */
    public abstract value(): T;

    /** throws `InvalidResultUnwrap` if not `Err`, not to be catched. */
    public abstract error(): E;

    public match<R>(ifOk: (value: T) => R, ifErr: (error: E) => R): R {
        return this.isOk() ? ifOk(this.value()) : ifErr(this.error());
    }

    public mapValue<NT>(mapper: (value: T) => NT): Result<NT, E> {
        return this.isOk()
            ? new Ok(mapper(this.value()))
            : new Err(this.error());
    }
    public mapError<NE>(mapper: (error: E) => NE): Result<T, NE> {
        return this.isErr()
            ? new Err(mapper(this.error()))
            : new Ok(this.value());
    }

    /** Monadic version of `mapValue` 🤓 */
    public flatMap<NT>(mapper: (value: T) => Result<NT, E>): Result<NT, E> {
        return this.isOk() ? mapper(this.value()) : new Err(this.error());
    }
    /** Monadic version of `mapError` 🤓 */
    public flatMapError<NE>(
        mapper: (error: E) => Result<T, NE>,
    ): Result<T, NE> {
        return this.isErr() ? mapper(this.error()) : new Ok(this.value());
    }

    /**
     * **NOT typesafe**
     *
     * This just convinces Typescript that the `Result<T, E>` is actually `Result<NT, NE>`,
     * sort of like a 'cast' in other languages.
     *
     * Example of when to use:
     * ```typescript
     * function inner(): Result<OneType, ErrorType>;
     *
     * function mayFail(): Result<OtherType, ErrorType> {
     *     const result = inner();
     *     if (result.isErr()) {
     *         // because we know `result` is an `Err`,
     *         // we can safe return it,
     *         // because both results have `E extends ErrorType`.
     *         return result.transform();
     *     }
     * }
     * ```
     */
    public transform<NT, NE>(): Result<NT, NE> {
        return this as unknown as Result<NT, NE>;
    }

    public transmogrifyPromiseValue<U, P = Promise<U>>(
        func: (value: P) => Promise<Result<U, E>>,
    ): Promise<Result<U, E>> {
        return this.isOk()
            ? Promise.resolve(func(this.value() as unknown as P))
            : Promise.resolve(new Err<U, E>(this.error()));
    }
}

export class InvalidResultUnwrap extends Error {
    public constructor(message: string = "") {
        super("InvalidResultUnwrap: " + message);
    }
}

export class Ok<T, E> extends Result<T, E> {
    public constructor(private _value: T) {
        super();
    }

    public isOk(): boolean {
        return true;
    }
    public isErr(): boolean {
        return false;
    }
    public value(): T {
        return this._value;
    }
    public error(): E {
        throw new InvalidResultUnwrap(
            "tried to unwrap Result as Err, but Result was Ok",
        );
    }
}

export class Err<T, E> extends Result<T, E> {
    public constructor(private _error: E) {
        super();
    }

    public isOk(): boolean {
        return false;
    }
    public isErr(): boolean {
        return true;
    }
    public value(): T {
        throw new InvalidResultUnwrap(
            "tried to unwrap Result as Ok, but Result was Err",
        );
    }
    public error(): E {
        return this._error;
    }
}
