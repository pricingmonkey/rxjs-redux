import * as chai from 'chai';

chai.config.truncateThreshold = 0;
chai.config.includeStack = true;

import { expect } from 'chai';
import { of } from 'rxjs';
import { auditMap } from '../src';
import { TestScheduler } from './testScheduler';
import { delay } from 'rxjs/operators';

describe('auditMap', () => {
  it('should make sure to ignore any BUT LAST value sent while inner observable hasnt completed', () => {
    const scheduler = new TestScheduler();

    const input$ = scheduler.inputStreamBuilder()
      .emit(0, 1)
      .emit(10, 2)
      .emit(15, 3)
      .emit(20, 4)
      .emit(25, 5)
      .build();

    const observable$ = input$.pipe(auditMap(item => of(item).pipe(delay(50, scheduler))));

    const values = scheduler.run(observable$);

    expect(values).to.eql([{
      time: 50,
      value: 1
    }, {
      time: 100,
      value: 5
    }]);
  });

  it('should process all items if no new values arrive within the boundary of inner observable processing', () => {
    const scheduler = new TestScheduler();

    const input$ = scheduler.inputStreamBuilder()
      .emit(0, 1)
      .emit(20, 2)
      .emit(40, 3)
      .emit(60, 4)
      .build();

    const observable$ = input$.pipe(auditMap(item => of(item).pipe(delay(10, scheduler))));

    const values = scheduler.run(observable$);

    expect(values).to.eql([{
      time: 10,
      value: 1
    }, {
      time: 30,
      value: 2
    }, {
      time: 50,
      value: 3
    }, {
      time: 70,
      value: 4
    }]);
  });
});
