import React from 'react';

export default class Test extends React.Component {

  static status() {
    return [];
  }

  static all() {
    return [{
      num: 0,
      name: 'noNewTiles',
    },{
      num: 1,
      name: 'allOnes',
    },{
      num: 2,
      name: 'displayScores'
    },{
      num: 3,
      name: 'showTileLogic'
    },{
      num: 4,
      name: 'noMovesLeft'
    },{
      num: 5,
      name: 'largeStartValues'
    }];
  }

  static isNoTest() {
    return this.status().length === 0;
  }

  static isType(testName) {
    const testStatus = this.status();
    const testStates = this.all();
    let matchFound = false;
    if (testStatus.length === 0) {
      return false;
    } else {
      testStatus.forEach((num) => {
        let testMatch = testStates.find((test) => test.num === num);
        if (testMatch && (testMatch.name === testName)) {
          matchFound = true;
        }
      });
      return matchFound;
    }
  }

  static allNames() {
    const testStates = this.all();
    let allNames = this.status().map((num) => {
      let testMatch = testStates.find((test) => test.num === num);
      return testMatch.name;
    });
    return allNames;
  }

  render () {
    const testInfo = Test.isNoTest() ?
      null :
      <p className='Test'><strong>Test Mode:</strong> {Test.allNames().join(', ')}</p>;
    return testInfo;
  }
}
