/**
    Acknowlegdements:
    - This `Optional` implementation could be optimised to be faster and use less memory
    - Inheritance and abstract classes suck,
        interfaces and implementations are better,
        but in this case would require an undesireable amount of code repetition.
    - Exceptions suck,
        but is the best/only standard way of exitting cleanly,
        let's just hope no-one tries to catch them.
*/
export abstract class Optional<T> {
    protected constructor() {}

    public abstract isSome(): boolean;
    public abstract isNone(): boolean;

    /** throws `InvalidOptionalUnwrap` if not `Some`, not to be catched. */
    public abstract value(): T;

    public match<R>(ifSome: (value: T) => R, ifNone: () => R): R {
        return this.isSome() ? ifSome(this.value()) : ifNone();
    }

    public mapValue<NT>(mapper: (value: T) => NT): Optional<NT> {
        return this.isSome() ? new Some(mapper(this.value())) : new None();
    }

    /** Monadic version of `mapValue` 🤓 */
    public flatMap<NT>(mapper: (value: T) => Optional<NT>): Optional<NT> {
        return this.isSome() ? mapper(this.value()) : new None();
    }

    /**
     * **NOT typesafe**
     *
     * This just convinces Typescript that the `Optional<T>` is actually `Optional<NT>`,
     * sort of like a 'cast' in other languages.
     *
     * Example of when to use:
     * ```typescript
     * function inner(): Optional<OneType>;
     *
     * function mayFail(): Optional<OtherType> {
     *     const optional = inner();
     *     if (optional.isNone()) {
     *         // because we know `optional` is a `None`,
     *         // we can safe return it
     *         return optional.transform();
     *     }
     * }
     * ```
     */
    public transform<NT>(): Optional<NT> {
        return this as unknown as Optional<NT>;
    }
}

export class InvalidOptionalUnwrap extends Error {
    public constructor(message: string = "") {
        super("InvalidOptionalUnwrap: " + message);
    }
}

export class Some<T> extends Optional<T> {
    public constructor(private _value: T) {
        super();
    }

    public isSome(): boolean {
        return true;
    }
    public isNone(): boolean {
        return false;
    }
    public value(): T {
        return this._value;
    }
}

export class None<T> extends Optional<T> {
    public constructor() {
        super();
    }

    public isSome(): boolean {
        return false;
    }
    public isNone(): boolean {
        return true;
    }
    public value(): T {
        throw new InvalidOptionalUnwrap(
            "tried to unwrap Optional as Some, but Optional was None",
        );
    }
}
