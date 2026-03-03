/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { freeze, nothing, produce } from "immer";
import { useCallback, useMemo, useReducer, useState } from "react";

import type { Draft } from "immer";

export type ImmerState = Exclude<object, Function>;

export type DraftFunction<S extends ImmerState> = (draft: Draft<S>) => void;
export type Updater<S extends ImmerState> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S extends ImmerState> = [S, Updater<S>];

export function useImmer<S extends ImmerState>(initialValue: S | (() => S)): ImmerHook<S> {
  const [val, updateValue] = useState(() =>
    freeze(typeof initialValue === "function" ? initialValue() : initialValue, true)
  );

  return [
    val,
    useCallback((updater) => {
      if (typeof updater === "function") {
        updateValue(produce(updater));
      } else {
        updateValue(freeze(updater));
      }
    }, []),
  ];
}

export type ImmerReducer<S extends ImmerState, A> = (
  draftState: Draft<S>,
  action: A
) => void | (S extends undefined ? typeof nothing : S);

export function useImmerReducer<S extends ImmerState, A>(reducer: ImmerReducer<S, A>, initialState: S) {
  const cachedReducer = useMemo(() => produce(reducer) as unknown as (prevState: S, ...args: Array<A>) => S, [reducer]);
  return useReducer(cachedReducer, initialState);
}
