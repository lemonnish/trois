import React from 'react';
import calculateScore from './calculateScore.js';
import calculateDisplayValue from './calculateDisplayValue.js';
import Test from './test.js';

export default class GameTile extends React.Component {
  // props:
  // - value = null / 0 / 1 / 2 / ...
  // - gameOver = true / false
  // - type = 'nextTile' / 'gamePiece' / 'background'
  // - prevValue = null / 0 / 1 / 2 / ...
  //      value of tile originally at location, only applicable if 2 tiles will add
  //      if prevValue = 3, then assume tile that moves has value = 3, and props.value = 6
  // - animateDirection = null / 'up' / 'right' / 'down' / 'left'
  //      movement for tile to get from prev state to curr state
  // - doAnimations = true / false

  getClassName(value, extraClass) {
    const className = 'game-tile game-tile-value-' + value;
    return (extraClass ? (className + ' ' + extraClass) : className);
  }

  renderDisplay(value) {
    if (value === null) {
      return null;
    } else {
      return (<span>{calculateDisplayValue(value)}</span>);
    }
  }

  renderScore(value) {
    const score = calculateScore(value);
    if ((this.props.gameOver || Test.isType('displayScores')) &&
        (this.props.type !== 'nextTile') &&
        (score !== null)) {
      return (<span className='score'>{score}</span>);
    } else {
      return null;
    }
  }

  renderAnimatedTile(baseValue, moveValue, overlayValue, removeValue, moveDir) {
    const animateDirClass = 'animate-' + moveDir;
    const animateDelayClass = 'animate-delay';
    const animateRemoveClass = 'animate-remove';
    const baseClass = 'no-animate';

    const baseTile = (baseValue === null) ? null : this.renderStaticTile(baseValue, baseClass);
    const moveTile = (moveValue === null) ? null : this.renderStaticTile(moveValue, animateDirClass);
    const overlayTile = (overlayValue === null) ? null : this.renderStaticTile(overlayValue, animateDelayClass);
    const removeTile = (removeValue === null) ? null : this.renderStaticTile(removeValue, animateRemoveClass);

    return (
      <div className='GameTile animatedGroup'>
        {baseTile}
        {moveTile}
        {overlayTile}
        {removeTile}
      </div>
    );
  }

  renderStaticTile(value, moreClass) {

    return (
      <div className={this.getClassName(value, moreClass)}>
        {this.renderDisplay(value)}
        {this.renderScore(value)}
        {Test.isType('showTileLogic') ? this.props.debug : null}
      </div>
    );
  }

  render() {
    if (this.props.type === 'background') {
      return (
        <div className='GameTile background'>
        </div>
      );
    } else if (this.props.doAnimations) {
      return this.renderAnimatedTile(this.props.baseValue,
                                     this.props.moveValue,
                                     this.props.overlayValue,
                                     this.props.removeValue,
                                     this.props.animateDirection);
    } else {
      return this.renderStaticTile(this.props.value, 'GameTile');
    }
  }
}

/*
# Proposed edits:

- make GameTile have state
- prev value (only given if 2 tiles will add together at this location)
  - you can assume that if this value is set, then at the start of animation,
    the tile at this location and the tile moving into the location have the same value.
  - this value will be replaced with curr value once the animation concludes
- curr value
- direction of movement (to animate curr value)
- animated (?) (boolean)

if direction is null, then the tile will fade in (not slide in)
if direction is 'none', then no animation

# Types of movements:
- tile slides in
- tile adds with current value to produce new tile
- random new tile is added to the board (fade in)

all movements are relative to the final position of the tile.

## Tile adds
- create 2 divs, both styled as tiles
- 1 div is still (main position), the other slides in from a particular direction
- when the 2 divs stack, the top (visible) one displays the new value
- when the board redraws, the 2 stacked divs are replaced with a single div

# Other notes

- allow user to adjust speed of animation (slider?)
  - this requires being able to edit CSS speed transition value from React state

*/
