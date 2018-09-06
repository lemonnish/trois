import React from 'react';
import GameTile from './gameTile.js';

export default class Board extends React.Component {
  // props:
  // - currentState
  // - previousState
  // - gameOver={possibleMoves.gameOver}
  // - doAnimations={this.state.doAnimations}
  // - animateUndo

  // state.gameTiles = game board
  // state.moveTiles = which tiles moved to produce .gameTiles
  // state.movePos = direction of movement
  // if there is no later/earlier state, then currentState_P1/_M1 = null

  reverseDirection(direction) {
    switch (direction) {
      case 'up':
        return 'down';
      case 'right':
        return 'left';
      case 'down':
        return 'up';
      case 'left':
        return 'right';
      default:
        return null;
    }
  }

  getUndoTileValues(row, col, maxRow, maxCol, currState, prevState) {
    const moveDir = this.reverseDirection(prevState.movePos);
    let [baseValue, moveValue, overlayValue, removeValue] = [null, null, null, null];
    let extraContent = 'undo;';

    const currTile = currState.gameTiles[row][col];
    const prevTile = prevState ? prevState.gameTiles[row][col] : null;
    const prevMove = prevState.moveTiles[row][col];

    if (prevMove === 'new') {
      extraContent += 'new-R;';
      removeValue = prevTile;
      if (currTile !== null) {
        extraContent += 'M;';
        moveValue = currTile;
      }
    } else if (prevMove === true) {
      moveValue = currTile;
      extraContent += 'moveT-M;';
    } else {
      baseValue = currTile;
      extraContent += 'moveT-B;';
    }
    return [baseValue, moveValue, overlayValue, removeValue, moveDir, extraContent];

  }

  getTileValues(row, col, maxRow, maxCol, currState, prevState) {
    let searchRow, searchCol;
    let moveDir = this.props.animateUndo ? this.reverseDirection(prevState.movePos) : currState.movePos;
    let [baseValue, moveValue, overlayValue, removeValue] = [null, null, null, null];
    let isBaseCase = false;
    let extraContent = '';

    switch (moveDir) {
      case 'up':
        if (row >= maxRow) isBaseCase = true;
        [searchRow, searchCol] = [row + 1, col];
        break;
      case 'right':
        if (col <= 0) isBaseCase = true;
        [searchRow, searchCol] = [row, col - 1];
        break;
      case 'down':
        if (row <= 0) isBaseCase = true;
        [searchRow, searchCol] = [row - 1, col];
        break;
      case 'left':
        if (col >= maxCol) isBaseCase = true;
        [searchRow, searchCol] = [row, col + 1];
        break;
      default:
        isBaseCase = true;
        break;
    }

    const currMove = currState.moveTiles[row][col];
    const currMoveSearch = isBaseCase ? null : currState.moveTiles[searchRow][searchCol];
    const currTile = currState.gameTiles[row][col];
    const prevTile = prevState ? prevState.gameTiles[row][col] : null;
    const prevTileSearch = (prevState && !isBaseCase) ? prevState.gameTiles[searchRow][searchCol] : null;

    if (currMove === 'new') {
      // new tile was added
      overlayValue = currTile;
      extraContent += 'new O;';
    } else if (isBaseCase) {
      extraContent += 'baseCase-';
      if ((currMove === false) || (currMove === null)) {
        baseValue = currTile;
        extraContent += 'B;';
      }
    } else {
      if ((currMoveSearch === true) || (currMoveSearch === 'new')) {
        moveValue = prevTileSearch;
        extraContent += 'searchT-M;';
        if ((currMove === false) && (prevTile !== null)) {
          // sum tiles at this location
          baseValue = prevTile;
          overlayValue = currTile;
          extraContent += 'sum-BO;';
        }
      } else {
        baseValue = currTile;
        extraContent += 'searchF-B;';
      }
    }
    return [baseValue, moveValue, overlayValue, removeValue, moveDir, extraContent];
  }

  render() {
    const gameTiles = this.props.currentState.gameTiles;
    const maxRow = gameTiles.length - 1;
    const maxCol = gameTiles[0].length - 1;
    const currState = this.props.currentState;
    const prevState = this.props.previousState;
    let baseValue, moveValue, overlayValue, removeValue, extraText, moveDir, key;

    return (
      <div className='Board'>
        <div className='background'>
          {gameTiles.map((x, rowNum) => (
            <div className='game-row background' key={rowNum}>
              {x.map((y, colNum) =>
                <GameTile value={null}
                          type='background'
                          key={maxRow * rowNum + colNum} />
              )}
            </div>
          ))}
        </div>

        <div className='game-board'>
        {gameTiles.map((x, rowNum) => (
          <div className='game-row' key={rowNum}>
            {x.map((y, colNum) => {
              [baseValue, moveValue, overlayValue, removeValue, moveDir, extraText] =
                this.props.animateUndo ?
                this.getUndoTileValues(rowNum, colNum, maxRow, maxCol, currState, prevState) :
                this.getTileValues(rowNum, colNum, maxRow, maxCol, currState, prevState);
              key = (maxRow * rowNum + colNum);
              key += ((moveValue !== null) || (overlayValue !== null)) ? Math.random() : 0;
              return (
                <GameTile value={y}
                          gameOver={this.props.gameOver}
                          type='gamePiece'
                          doAnimations={this.props.doAnimations}
                          baseValue={baseValue}
                          moveValue={moveValue}
                          overlayValue={overlayValue}
                          removeValue={removeValue}
                          animateDirection={moveDir}
                          debug={extraText}
                          key={key}/>
              );
            })}
          </div>
        ))}
        </div>
      </div>
    );
  }
}
