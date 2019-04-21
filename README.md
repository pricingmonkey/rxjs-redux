# RxJS-Redux

React-Redux-like bindings for Redux Observable

## What is this?

**Easy to understand** and **testable** alternative to managing asynchronous behaviour with [redux-observable](https://github.com/redux-observable/redux-observable).

## How it works

This library is significantly influenced by [react-redux](https://github.com/reduxjs/react-redux). So much so, that it can be explained with a rehashed description of react-redux:

>rxjs-redux is conceptually pretty simple. It subscribes to the stream of Redux state, checks to see if the data your epic wants has changed, and re-executes the business logic of your epic.

By reusing already familiar approach this library brings simplicity to your applications.

## Install

This has peer dependencies of rxjs@6.x.x, redux@4.x.x and redux-observable@1.x.x, which will have to be installed as well.

       npm install --save rxjs-redux

or

       yarn add rxjs-redux

## Usage

This library integrates out of the box with `redux-observable`.

```typescript
import { connect, stateObserverAsEpic } from 'rxjs-redux';
import { combineEpics } from 'redux-observable';

const mapStateToProps = (state: State) => ({
  property: state.property
});

const mapPropsToAction = (props: Props) => {
    if (property === "SPECIAL") {
      return { type: "SPECIAL_DETECTED" };
    }
    return { type: "BORING_PROPERTY", property };
}

const stateObserver = state$ => state$.pipe(
    connect(mapStateToProps),
    map(mapPropsToAction)
);

combineEpics(
  stateObserverAsEpic(stateObserver)
);
```

### Custom props equality


```typescript
const arePropsEqual = (previousProps: Props, currentProps: Props) => {
  return previousProps.singleProperty === currentProps.singleProperty;
};

state$.pipe(
    connect(mapStateToProps, { arePropsEqual }),
    map(mapPropsToAction)
);
```

## Recipes

### Dispatch plain actions

```typescript
const mapPropsToActions = (props: Props) => {
    return [...];
}

state$.pipe(
    connect(mapStateToProps),
    map(mapPropsToActions),
    flatMap(actions => from(actions))
);
```

### Dispatch actions from an asynchronous operation

Use when you need to invoke an asynchronous operation that returns an action - most commonly when calling REST API.

```typescript
const mapPropsToObservable = (props: Props) => {
    return from(returnPromise(props));
}

state$.pipe(
    connect(mapStateToProps),
    flatMap(mapPropsToObservable)
);
```

#### Limit invocations to one at a time

Sometimes props change faster than the the time to finish async operation. If that happens it helps to:
 - run only one `mapPropsToObservable` at a time (ignoring other prop changes in the meantime)
 - always make sure `mapPropsToObservable` one final time with the most recent props.

You can get this behaviour by replacing `flatMap` operator with [auditMap](https://github.com/ReactiveX/rxjs/issues/1777):

```typescript
import { auditMap } from 'rxjs-redux';

const mapPropsToObservable = (props: Props) => {
    return from(returnPromise(props));
}

state$.pipe(
    connect(mapStateToProps),
    auditMap(mapPropsToObservable)
);
```

### Trigger side effect

Use when your epic is causing a side effect - eg. setting a cookie or calling a REST API where you don't care about response.

```typescript
const mapPropsToSideEffect = (obs: Observable<Props>) =>
    obs.pipe(
        tap(props => { ... }),
        ignoreElements()
    );

state$.pipe(
    connect(mapStateToProps),
    mapPropsToSideEffect
);
```

### Handle changes in collections

```typescript
// Item Epic

const mapItemToProps = (props: ItemProps) => ({
  id: props.item.id,
  description: props.item.description,
  context: pops.context
});

const processItem = (inputProps$: Observable<ItemProps>) =>
  itemProps$.pipe(
    connect(mapItemPropsToProps),
    flatMap(props => {
      return { type: "CHANGED_IN_ITEM", id: item.id, id: item.description, context };
    })
  );

// List Epic

const mapInputToProps = (state: State) => ({
  list: state.list,
  context: state.context
});

const arePropsEqual = (previousProps: Props, currentProps: Props) => {
  return previousProps.list === currentProps.list;
};

state$.pipe(
    connect(mapInputToProps),
    flatMap(props => {
      return from(props.list).map(item => ({
        item,
        context: props.context
      }))
    }),
    groupBy(item => item.id),
    flatMap(processItem)
);
```

## License

Blue Oak Model License

MIT ([src/shallowEqual.ts](src/shallowEqual.ts))