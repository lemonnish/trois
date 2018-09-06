import React from 'react';
import { sum, max } from 'lodash';
import calculateDisplayValue from './calculateDisplayValue.js';
import PlotScatter from './plotScatter.js';
import PlotHorizontalBar from './plotHorizontalBar.js';

export default class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: null,
    };
  }

  items() {
    const classTabContent = 'tab-content';
    return [
      {
        name: 'instructions',
        title: 'Instructions',
        content: (() =>
          <div className={classTabContent}>
            <h2>Instructions for play</h2>
            <p>The goal of Threes is to maximize your score by combining as many
              tiles as possible.</p>
            <p>Click on the arrow keys to slide all tiles on the board one space in the specified direction.
              Tiles remain within the game borders; the borders act like walls that tiles are unable to pass through.</p>
            <p>White tiles are multiples of 3. If a white tile is pushed into a stationary tile of the same value,
              then the tiles will combine into one tile, and their values will add.</p>
            <p>Orange and blue tiles are special. An orange tile will always have a value of 1,
              and a blue tile will always have a value of 2. An orange tile can
              only be combined with a blue tile (and vice versa).</p>
            <p>Remember, everything is based around the number 3!</p>
            <ul>
              <li>1 + 2 = 3</li>
              <li>3 + 3 = 6</li>
              <li>6 + 6 = 12</li>
              <li>etc.</li>
            </ul>
            <p>After every move, a new tile is randomly placed onto the board.
              The value of this tile is randomly chosen, and cannot be larger
              than the largest-value tile already on the board.</p>

            <h3>Game over</h3>
            <p>The game ends when no more moves can be made.</p>

            <h3>Scoring</h3>
            <p>Your score is the sum of the scores of every tile on the board.</p>
            <p>Tiles with a value of 1 or 2 have a score of 0.</p>
            <p>For all other tiles, the displayed value and score are calculated
              based on an assigned rank. For example:</p>
            <table className='example'>
              <thead><tr>
                <th>Tile rank</th>
                <th>Tile val<span className='wide'>ue</span></th>
                <th>Val<span className='wide'>ue</span> calc<span className='wide'>ulation</span></th>
                <th>Tile score</th>
                <th>Score calc<span className='wide'>ulation</span></th>
              </tr></thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td>3</td>
                  <td>3 &#215; 2 ^ 0</td>
                  <td>3</td>
                  <td>3 ^ 1</td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>6</td>
                  <td>3 &#215; 2 ^ 1</td>
                  <td>9</td>
                  <td>3 ^ 2</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>12</td>
                  <td>3 &#215; 2 ^ 2</td>
                  <td>27</td>
                  <td>3 ^ 3</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>24</td>
                  <td>3 &#215; 2 ^ 3</td>
                  <td>81</td>
                  <td>3 ^ 4</td>
                </tr>
              </tbody>
            </table>
            <p>In the general case, the equations are as follows:</p>
            <table className='general'>
              <thead>
                <tr>
                  <th>Tile rank</th>
                  <th>Value equation</th>
                  <th>Score equation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>x</td>
                  <td>3 &#215; 2 ^ x</td>
                  <td>3 ^ (x + 1)</td>
                </tr>
              </tbody>
            </table>

          </div>),
      },
      {
        name: 'statistics',
        title: 'Statistics',
        content: (() =>
          <div className={classTabContent}>
            <h2>Game statistics</h2>
            <h3>Frequency of new tiles</h3>
            <p>New tiles are randomly selected from a list of all tiles less than or equal to the largest tile on the board.</p>
            {this.drawNewTiles()}
            <h3>Moves and game style</h3>
            <p>This is a summary of all played moves:</p>
            {this.drawMoves()}
          </div>),
      },
    ]
  }

  drawMoves() {
    let count = [0, 0, 0, 0]; // [up, right, down, left]
    const history = this.props.history.slice(0, this.props.stepNumber + 1);
    history.forEach(move => {
      switch (move.movePos) {
        case 'up':
          count[0] += 1;
          break;
        case 'right':
          count[1] += 1;
          break;
        case 'down':
          count[2] += 1;
          break;
        case 'left':
          count[3] += 1;
          break;
        default:
          break;
      }
    });
    const scaledCount = count.map((x) => sum(count) === 0 ? 0 : x * 100 / sum(count));

    return (
      <PlotHorizontalBar
          data={scaledCount}
          dataLabels={['up', 'right', 'down', 'left']}
          axisMarkers={[0, 25, 50, 75, 100]}
          axisUnit='%'
          svgWidth={800} />
    );
  }

  drawNewTiles() {
    const history = this.props.history.slice(0, this.props.stepNumber);
    const newTiles = history.map(move => move.nextTile);
    const maxValues = (history.length === 0) ?
      [] :
      history.map(move => max(move.gameTiles.map(x => max(x))));

    const xAxisMarkers = newTiles.map((x, i) => i);
    const yAxisMarkers = (maxValues.length === 0) ? [0, 1] : Array(max(maxValues) + 1).fill(0).map((x, i) => i);
    const xAxisLabels = xAxisMarkers.map(x => x + 1);
    const yAxisLabels = yAxisMarkers.map(x => calculateDisplayValue(x));

    return (
      <PlotScatter
          xAxisMarkers={xAxisMarkers}
          yAxisMarkers={yAxisMarkers}
          xAxisTitle='move #'
          yAxisTitle='tile value'
          xAxisLabels={xAxisLabels}
          yAxisLabels={yAxisLabels}
          dataScatter={newTiles}
          dataBar={maxValues}
          svgWidth={800}
          svgHeight={200}
          />
    );
  }

  onTabClick(i) {
    let newTab = null;
    if (this.state.currentTab !== i) newTab = i;
    this.setState({
      currentTab: newTab,
    });
  }

  renderTabButton(x, i) {
    let classNames = x.name;
    if (this.state.currentTab === i) classNames += ' active';
    const title = (this.state.currentTab === i ? 'Hide' : 'Show') + ' ' + x.name;
    return (
      <button className={classNames} key={i} title={title} onClick={() => this.onTabClick(i)}>
        {x.title}
      </button>
    )
  }

  renderContent(tabNum) {
    if (tabNum !== null) {
      const tabValues = this.items();
      return tabValues[tabNum].content();
    } else {
      return null;
    }
  }

  // props = state
  render() {
    let classTabButtons = 'tab-buttons';
    if (this.state.currentTab !== null) classTabButtons += ' active';
    return (
      <div className='Tabs'>
        <div className={classTabButtons}>
          {this.items().map((x, i) => this.renderTabButton(x,i))}
        </div>
        {this.renderContent(this.state.currentTab)}
      </div>
    )
  }
}
