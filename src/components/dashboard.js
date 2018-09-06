import React from 'react';
import calculateScore from './calculateScore.js';
import Icon from './icon.js';
import GameTile from './gameTile.js';
import GameControl from './gameControl.js';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showKeyboardShortcuts: true,
    };
  }

  renderStatus(gameTiles, nextTileValue) {
    const sum = (a,b) => a + b;
    const scoreSum = gameTiles.map(x => x.map(y => calculateScore(y)).reduce(sum)).reduce(sum);
    const scorePrint = scoreSum.toLocaleString();
    const nextTile = (() => {
      if (this.props.possibleMoves.gameOver) {
        return (
          <div className='next-tile'>
            <span className='game-over'>No remaining moves!</span>
          </div>
        )
      } else {
        return (
          <div className='next-tile'>
            <label>Next tile</label>
            <GameTile
              value={nextTileValue}
              gameOver={false}
              key='nextTile'
              type='nextTile'
            />
          </div>
        )
      }
    });

    return (
      <div className='game-status'>
        {nextTile()}
        <div className='score'>
          <label>Score</label>
          <span className='score'>{scorePrint}</span>
        </div>
      </div>
    );
  }

  renderToggleShortcuts() {
    const iconVisible = this.state.showKeyboardShortcuts ? 'eye-off' : 'eye';
    const toggleView = (() => {
      let showKeyboardShortcuts = this.state.showKeyboardShortcuts;
      this.setState({
        showKeyboardShortcuts: !showKeyboardShortcuts,
      });
    });
    const title = (this.state.showKeyboardShortcuts ? 'Hide' : 'Show') + ' keyboard shortcuts';
    return (
      <button className='toggleShortcuts'
              onClick={() => toggleView()}
              title={title}>
        {Icon(iconVisible)}
        <span>ABC</span>
      </button>
    )
  }

  renderUndo(history, stepNumber) {
    const keyboardShortcut = (() => {
      if (this.state.showKeyboardShortcuts) {
        return (
          <span className='keyboardShortcut'>U</span>
        )
      } else { return null }
    });

    return (
      <button className='undo'
              onClick={this.props.undoClick}
              disabled={stepNumber <= 0}
              title='Undo last move'
              key='undoButton'>
        Undo last move
        {keyboardShortcut()}
      </button>
    );
  }

  renderRestart() {
    return (
      <button className='restart'
              onClick={this.props.restartClick}
              title='Restart game'>
        Restart
      </button>
    );
  }

  render() {
    const state = this.props.state;
    const current = state.history[state.stepNumber].gameTiles;
    const nextTile = state.history[state.stepNumber].nextTile;
    const history = state.history;

    return (
      <div className='Dashboard'>
        {this.renderStatus(current, nextTile)}
        <GameControl
          possibleMove={this.props.possibleMoves}
          onClick={this.props.controllerClick}
          showKeyboardShortcuts={this.state.showKeyboardShortcuts}
        />
        {this.renderUndo(history, state.stepNumber)}
        {this.renderToggleShortcuts()}
        {this.renderRestart()}
      </div>
    )
  }
}
