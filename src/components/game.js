import React from 'react';
import Header from './header.js';
import Board from './board.js';
import Tabs from './tabs.js';
import Dashboard from './dashboard.js';
import Test from './test.js';


import { shuffle, max } from 'lodash';
var Mousetrap = require('mousetrap');

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 4,
      height: 4,
      history: [{
        gameTiles: this.getStartTiles(4,4),
        moveTiles: createArray(4,4,null),
        movePos: null,
        nextTile: Test.isType('noNewTiles') ? null : Math.round(Math.random()),
      }],
      stepNumber: 0,
      prevStepNumber: null,
      doAnimations: true,
    };
  }

  getStartTiles(width, height) {
    let startValues;
    let iters = Array(width * height).fill(0).map((x,i) => i);
    let randomizeTiles = true;
    let startArray = createArray(height, width, null);
    const isEven = ((num) => num % 2 === 0);

    if (Test.isType('noMovesLeft')) {
      startValues = Array(width * height).fill(0);
      if (Test.isType('largeStartValues')) {
        startValues = startValues.map((x, i) => i === 0 ? 3 : i - 1);
      } else if (!Test.isType('allOnes')) {
        randomizeTiles = false;
        startValues = startValues.map((x, i) => isEven(width) ?
          ((isEven(i) === isEven(Math.floor(i / width))) ? 3 : 4) :
          (isEven(i) ? 3 : 4));
      }
    } else if (Test.isType('largeStartValues')) {
      randomizeTiles = false;
      startValues = iters.map((x, i) => i === 0 ? null : i - 1);
    } else {
      startValues = (Test.isType('allOnes') ? [0, 0, 0, 0, 0, 0] : [0, 0, 0, 1, 1, 1]);
    }

    if (randomizeTiles) iters = shuffle(iters);
    startValues.forEach((x, i) => {
      startArray[Math.floor(iters[i]/height)][iters[i] % width] = x;
    })
    return startArray;
  }

  getNextTile(gameTiles, direction) {
    const maxCurrentTile = max(gameTiles.map(x => max(x)));
    const nextTile = Test.isType('noNewTiles') ? null : (
      (maxCurrentTile === 0) ?
      0 : shuffle(Array(maxCurrentTile).fill(0).map((x,i) => i))[0]);
    let nullTiles = [];

    const height = this.state.height;
    const width = this.state.width;

    switch (direction) {
      case 'up':
        gameTiles[height - 1].forEach((x, colNum) => {
          if (x === null) nullTiles.push((height - 1) * width + colNum);
        });
        break;
      case 'right':
        gameTiles.forEach((x, rowNum) => {
          if (x[0] === null) nullTiles.push(rowNum * width + 0);
        });
        break;
      case 'down':
        gameTiles[0].forEach((x, colNum) => {
          if (x === null) nullTiles.push(colNum);
        });
        break;
      case 'left':
        gameTiles.forEach((x, rowNum) => {
          if (x[width - 1] === null) nullTiles.push((rowNum + 1) * width - 1);
        });
        break;
      default:
        return null;
    }

    if (nullTiles.length === 0) {
      gameTiles.forEach((x, rowNum) => {
        x.forEach((y, colNum) => {
          if (y === null) nullTiles.push(rowNum * width + colNum);
        });
      });
    }

    const pos = shuffle(nullTiles)[0];

    const row = Math.floor(pos / this.state.height);
    const col = pos % this.state.width;
    return [row, col, nextTile];
  }

  allPossibleMoves(gameTiles) {
    // return an object will all legal moves
    //  if no movement possible: .up = null
    //  if movement possible: .up.movement = which tiles will move
    //                        .up.nextState = board state after movement
    //  .gameOver = [boolean] any moves remaining
    let moves = {
      up: this.possibleMove(gameTiles, 'up'),
      right: this.possibleMove(gameTiles, 'right'),
      down: this.possibleMove(gameTiles, 'down'),
      left: this.possibleMove(gameTiles, 'left'),
    };
    const gameOver = Object.values(moves).every(x => x === null);
    moves.gameOver = gameOver;
    return moves;
  }

  moveLogic(currTile, prevTile, checkState, loopNum, lastLoop) {
    let newCurrTile = null, newPrevTile = null;
    let movement = false;
    let standardTiles, miniTiles;

    if (loopNum > 0 && checkState === false && currTile !== null) { // move curr tile into prev tile spot
      movement = true;
      newPrevTile = currTile;
    } else if (loopNum > 0 && checkState) { // check tiles
      standardTiles = (currTile > 1) && (currTile === prevTile);
      miniTiles = (currTile === 0 && prevTile === 1) || (currTile === 1 && prevTile === 0);
      if ((standardTiles && (currTile === prevTile)) || miniTiles) {
        // combine prev and curr tiles in prev tile location
        movement = true;
        newPrevTile = miniTiles ? 2 : currTile + 1;
        checkState = false;
      } else {// copy prev value into new array
        newPrevTile = prevTile;
      }
    }
    if (lastLoop && checkState) { // last row
      newCurrTile = currTile;
    }
    checkState = checkState ? currTile !== null : false;

    return [newCurrTile, newPrevTile, movement, checkState];
  }

  possibleMove(gameTiles, direction) {
    // helper to allPossibleMoves()
    // given game board and direction, figure out what the new board looks like
    //  if no movement possible, return: null
    //  if movement possible, return: .movement = which tiles will move
    //                                .nextState = board state after movement
    const numRows = gameTiles.length;
    const numCols = gameTiles[0].length;
    let movement = createArray(numRows, numCols, false);
    let nextState = createArray(numRows, numCols, null);
    let movementPossible = false;
    let currTile, prevTile;
    let gameLogic;
    let loopNum, lastLoop;
    let checkState;

    switch (direction) {
      case 'up':
        // check state of every col
        // if true, check if row can be combined with prev row
        // if false, that tile will be moved
        checkState = new Array(numCols).fill(true);
        for (let row=0; row < numRows; row++) {
          loopNum = row;
          lastLoop = row === (numRows - 1);
          for (let col=0; col < numCols; col++) {
            currTile = gameTiles[row][col];
            prevTile = (row > 0) ? gameTiles[row-1][col] : null;
            gameLogic = this.moveLogic(currTile, prevTile, checkState[col], loopNum, lastLoop);
            if (lastLoop) nextState[row][col] = gameLogic[0];
            if (row > 0) nextState[row-1][col] = gameLogic[1];
            movementPossible = movementPossible ? true : gameLogic[2];
            movement[row][col] = gameLogic[2];
            checkState[col] = gameLogic[3];
          }
        }
        break;

      case 'right':
        checkState = new Array(numRows).fill(true);
        for (let col=numCols-1; col>=0; col--) {
          loopNum = numCols - col - 1;
          lastLoop = col === 0;
          for (let row=0; row<numRows; row++) {
            currTile = gameTiles[row][col];
            prevTile = (col < numCols - 1) ? gameTiles[row][col+1] : null;
            gameLogic = this.moveLogic(currTile, prevTile, checkState[row], loopNum, lastLoop);
            if (lastLoop) nextState[row][col] = gameLogic[0];
            if (col < numCols-1) nextState[row][col+1] = gameLogic[1];
            movementPossible = movementPossible ? true : gameLogic[2];
            movement[row][col] = gameLogic[2];
            checkState[row] = gameLogic[3];
          }
        }
        break;

      case 'down':
        checkState = new Array(numCols).fill(true);
        for (let row=numRows-1; row>=0; row--) {
          loopNum = numRows - row - 1;
          lastLoop = row === 0;
          for (let col=0; col<numCols; col++) {
            currTile = gameTiles[row][col];
            prevTile = (row < numRows - 1) ? gameTiles[row+1][col] : null;
            gameLogic = this.moveLogic(currTile, prevTile, checkState[col], loopNum, lastLoop);
            if (lastLoop) nextState[row][col] = gameLogic[0];
            if (row < numRows-1) nextState[row+1][col] = gameLogic[1];
            movementPossible = movementPossible ? true : gameLogic[2];
            movement[row][col] = gameLogic[2];
            checkState[col] = gameLogic[3];
          }
        }
        break;

      case 'left':
        checkState = new Array(numRows).fill(true);
        for (let col=0; col < numCols; col++) {
          loopNum = col;
          lastLoop = col === (numCols - 1);
          for (let row=0; row < numRows; row++) {
            currTile = gameTiles[row][col];
            prevTile = (col > 0) ? gameTiles[row][col-1] : null;
            gameLogic = this.moveLogic(currTile, prevTile, checkState[row], loopNum, lastLoop);
            if (lastLoop) nextState[row][col] = gameLogic[0];
            if (col > 0) nextState[row][col-1] = gameLogic[1];
            movementPossible = movementPossible ? true : gameLogic[2];
            movement[row][col] = gameLogic[2];
            checkState[row] = gameLogic[3];
          }
        }
        break;
      default:
        return null;
    }
    if (movementPossible) {
      return {movement: movement, nextState: nextState};
    } else {
      return null;
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0,this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const possibleMoves = this.allPossibleMoves(current.gameTiles);

    if (possibleMoves[i] === null) {
      return;
    }
    let newGameTiles = possibleMoves[i].nextState;
    let movement = possibleMoves[i].movement;
    let [row, col, nextTile] = this.getNextTile(newGameTiles, i);
    newGameTiles[row][col] = current.nextTile;
    movement[row][col] = 'new';
    this.setState({
      history: history.concat([{
        gameTiles: newGameTiles,
        moveTiles: movement,
        movePos: i,
        nextTile: nextTile,
      }]),
      stepNumber: history.length,
      prevStepNumber: history.length - 1,
    });
  }

  handleUndoClick() {
    const stepNumber = this.state.stepNumber;
    if (stepNumber < 1) {
      return;
    } else {
      this.setState({
        stepNumber: stepNumber - 1,
        prevStepNumber: stepNumber,
      });
    }
  }

  handleRestartClick() {
    this.setState({
      history: [{
        gameTiles: this.getStartTiles(4,4), //[[0,null,0,1],[null,null,null,null],[null,0,null,null],[null,null,1,null]],
        moveTiles: createArray(4,4,null),
        movePos: null,
        nextTile: Math.round(Math.random()),
      }],
      stepNumber: 0,
      prevStepNumber: null,
    });
  }

  handleKeypress() {
    Mousetrap.bind('w', () => this.handleClick('up') );
    Mousetrap.bind('d', () => this.handleClick('right') );
    Mousetrap.bind('s', () => this.handleClick('down') );
    Mousetrap.bind('a', () => this.handleClick('left') );
    Mousetrap.bind('u', () => this.handleUndoClick() );
  }

  render() {
    const stepNum = this.state.stepNumber;
    const prevStepNum = this.state.prevStepNumber;
    const currentState = this.state.history[stepNum];
    const previousState = (prevStepNum !== null) ? this.state.history[prevStepNum] : null;
    const drawUndo = prevStepNum > stepNum;

    const possibleMoves = this.allPossibleMoves(currentState.gameTiles);
    this.handleKeypress();

    return (
      <div className='Game'>
        <Header/>
        <Board
          currentState={currentState}
          previousState={previousState}
          gameOver={possibleMoves.gameOver}
          doAnimations={this.state.doAnimations}
          animateUndo={drawUndo}
        />
        <Dashboard
          state={this.state}
          controllerClick={(i) => this.handleClick(i)}
          undoClick={() => this.handleUndoClick()}
          possibleMoves={possibleMoves}
          restartClick={() => this.handleRestartClick()}
        />
        <Tabs
          history={this.state.history}
          stepNumber={this.state.stepNumber}
        />
      </div>
    );
  }
}

function createArray(numRows, numCols, value) {
  let arr = new Array(numRows);
  for (let i=0; i<numRows; i++) {
    arr[i] = new Array(numCols).fill(value);
  }
  return arr;
}
