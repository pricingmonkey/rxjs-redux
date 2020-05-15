<a name="1.1.1"></a>
## [1.1.1](https://github.com/pricingmonkey/rxjs-redux/compare/v1.0.2...v1.1.1) (2020-05-15)


### Features

* **connect:** Allow to separate 'state props' (which would cause epic retrigger) & context props (which don't cause epic retrigger, but might be used in the processing downstream.

<a name="1.0.2"></a>
## [1.0.2](https://github.com/pricingmonkey/rxjs-redux/compare/v1.0.1...v1.0.2) (2019-04-26)


### Features

* **documentation:** refactor why and how it works

<a name="1.0.1"></a>
## [1.0.1](https://github.com/pricingmonkey/rxjs-redux/compare/v1.0.0...v1.0.1) (2019-04-24)


### Features

* **shallowEqual:** Export at top level
* **documentation:** add section on testing

<a name="1.0.0"></a>
# [1.0.0](https://github.com/pricingmonkey/rxjs-redux/commits/v0.1.0) (2019-04-23)


### Features

* **connnect:** RxJS operator, maps source value into props and emits only when props change (by default uses shallow equality for comparison)
* **auditMap:** RxJS operator, similar to [exhaustMap](https://rxjs-dev.firebaseapp.com/api/operators/exhaustMap), but makes sure every source value is processed
* **stateObserverAsEpic:** convers state observer into redux-observable Epic### Features
