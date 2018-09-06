import React from 'react';
import { max, min } from 'lodash';

export default class PlotScatter extends React.Component {
  getMarkersSubset (markers, maxNumMarkers) {
    let skipLabel;

    let div = markers.length / maxNumMarkers;
    if (div <= 1) {
      skipLabel = 1;
    } else if (div <= 2) {
      skipLabel = 2;
    } else if (div <= 5) {
      skipLabel = 5;
    } else {
      skipLabel = 10 * (Math.floor(div / 10) + 1);
    }
    let markersSubset = Array(Math.floor(markers.length / skipLabel)).fill(0);
    return markersSubset.map((x, i) => markers[(i + 1) * skipLabel - 1]);
  }

  scatterPlotSize (minSize, maxSize, numPoints, plotWidth) {
    let radius = min([maxSize, plotWidth / (numPoints * 3)]);
    return max([radius, minSize]);
  }

  render() {
    const svgWidth = this.props.svgWidth;
    const svgHeight = this.props.svgHeight;
    const xLabelHeight = 40;
    const yLabelWidth = 40;
    const legendHeight = 20;

    const dataScatter = this.props.dataScatter;
    const dataBar = this.props.dataBar;

    const plotHeight = svgHeight - xLabelHeight - legendHeight;
    const plotDataHeight = plotHeight - 10;

    const xAxisMarkers = this.props.xAxisMarkers;
    const yAxisMarkers = this.props.yAxisMarkers;

    const yAxisMarkersSubset = this.getMarkersSubset(yAxisMarkers, Math.floor(plotHeight / 20));
    const xAxisMarkersSubset = this.getMarkersSubset(xAxisMarkers, 10);

    const viewBox = [0, 0, svgWidth, svgHeight].join(' ');
    const yLabel = 'tile value';
    const xLabel = 'move #';

    const xPlotWidth = (svgWidth - yLabelWidth - 10) / dataBar.length;
    const xPlot = (x) => xPlotWidth * x + 10 + yLabelWidth;
    const yPlot = (y) => plotDataHeight * (yAxisMarkers.length - y) / (yAxisMarkers.length) + 10;
    const rPlot = this.scatterPlotSize(2, 5, dataBar.length, (svgWidth - yLabelWidth - 10));

    return (
      <svg className='chart PlotScatter' viewBox={viewBox}>
        <g className='plot' transform={'translate(0,' + legendHeight + ')'}>
          <path className='max-values'
            d={['M', [yLabelWidth, plotHeight].join(',')].join(' ') +
            dataBar.map((x,i) => ' V' + yPlot(x + 1) + ' H' + xPlot(i + 1)) +
            ' V' + plotHeight}
          />

          {dataScatter.map((x, i) =>
            <g transform={'translate(' + xPlot(i) + ', 0)'} key={i}>
              <circle className={'plot-' + x}
                      cx={xPlotWidth / 2} cy={yPlot(x + 1)} r={rPlot} />
            </g>
          )}
          <g className='axis'>
            <line className='yAxis' key='yAxis'
                  x1={yLabelWidth} y1='0'
                  x2={yLabelWidth} y2={plotHeight} />
            <line className='xAxis' key='xAxis'
                  x1={yLabelWidth} y1={plotHeight}
                  x2={svgWidth} y2={plotHeight} />
            {yAxisMarkers.map(y =>
              <line key={y} x1={yLabelWidth - 2} y1={yPlot(y + 1)}
                            x2={yLabelWidth + 2} y2={yPlot(y + 1)} />
            )}
            {xAxisMarkers.map(x =>
              <line key={x} x1={xPlot(x + 0.5)} y1={plotHeight - 2}
                            x2={xPlot(x + 0.5)} y2={plotHeight + 2} />
            )}
          </g>
          <g className='x-axis-label' transform={'translate(0, ' + (plotHeight) + ')'}>
            {xAxisMarkersSubset.map(x =>
              <text x={xPlot(x + 0.5)} y="14.5" dy=".35em" key={x} className="axis-label">
                {this.props.xAxisLabels[x]}
              </text>
            )}
            <text x={(svgWidth - yLabelWidth) / 2 + yLabelWidth} y={xLabelHeight - 9.5} dy=".35em" key="label" className="axis-label">
              {xLabel}
            </text>
          </g>
          <g className='y-axis-label'>
            {yAxisMarkersSubset.map(y =>
              <text x={yLabelWidth - 10} y={9.5 + yPlot(y + 1)} dy="-.35em" key={y}>
                {this.props.yAxisLabels[y]}
              </text>
            )}
            <text x="9.5" y={(plotHeight) / 2} key="label" className="axis-label"
                  transform={"rotate(" + [-90, 9.5, (plotHeight) / 2].join(',') + ")"}>
              {yLabel}
            </text>
          </g>
        </g>

        <g transform={'translate(' + (yLabelWidth + 20) + ',0)'} className='legend'>
          <g transform='translate(0, 0)'>
            <circle className='plot-0' cx='5' cy='9.5' r={rPlot} />
            <circle className='plot-1' cx='15' cy='9.5' r={rPlot} />
            <circle cx='25' cy='9.5' r={rPlot} />
            <text x='40' y='9.5' dy='.35em'>new tile</text>
          </g>
          <g transform='translate(140, 0)'>
            <rect className='max-values' width='30' height='20' y='0'></rect>
            <text x='40' y='9.5' dy='.35em'>max board value</text>
          </g>
        </g>
      </svg>
    );
  }

}
