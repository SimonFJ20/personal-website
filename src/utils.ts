import { None, Optional, Some } from "./utils/Optional";

export function throwValue<E>(value: E): never {
    throw value;
}

export type Enum<T> = T[keyof T];

export const _ = Symbol("wildcard");

export const matchEqual = <T, R>(
    value: T,
    matchers: [T | typeof _, (value: T) => R][],
): R =>
    matchers.length > 0
        ? matchers[0][0] === _ || matchers[0][0] === value
            ? matchers[0][1](value)
            : matchEqual(value, matchers.slice(1))
        : throwValue(new Error("unexhaustive match"));

export function queryDOM<E extends HTMLElement>(query: string): Optional<E> {
    const element = document.querySelector<E>(query);
    return element ? new Some(element) : new None();
}
