import React from 'react';
import { max } from 'lodash';

export default class PlotHorizontalBar extends React.Component {

  render() {
    const data = this.props.data;
    const dataLabels = this.props.dataLabels;
    const axisMarkers = this.props.axisMarkers;// [0, 25, 50, 75, 100];
    const axisUnit = this.props.axisUnit;//'%';
    const barHeight = 20;
    const labelHeight = 20;
    const svgWidth = this.props.svgWidth; //800;
    const svgHeight = data.length * barHeight + labelHeight;
    const position = (i) => 'translate(0, ' + (i * barHeight + labelHeight + 3) + ')';
    const labelWidth = 50;
    const maxBarWidth = svgWidth - labelWidth - 1;
    const scaledNum = (i, values) => (maxBarWidth * values[i] / max(axisMarkers));
    const viewBox = [0, 0, svgWidth, svgHeight].join(' ');
    const offset = 5;

    return (
      <svg className='chart PlotHorizontalBar' viewBox={viewBox}>
        {dataLabels.map((label, i) =>
          <g transform={position(i)} key={label}>
            <rect width={scaledNum(i, data)} height="18" x={labelWidth}></rect>
            <text x={labelWidth - offset} y="9.5" dy=".35em">{label}</text>
          </g>
        )}
        <g className='axis'>
          <line x1='0' y1={labelHeight} x2={svgWidth} y2={labelHeight}/>
          {axisMarkers.map((x, i) =>
            <line x1={labelWidth + scaledNum(i,axisMarkers)} y1='0'
                  x2={labelWidth + scaledNum(i,axisMarkers)} y2={svgHeight}
                  key={'axis-' + x}/>
          )}
        </g>
        <g className='axis-label' transform={'translate('+labelWidth+', 0)'}>
          {axisMarkers.map((x, i) =>
            <text x={scaledNum(i,axisMarkers) - offset} y="9.5" dy=".35em" key={'label-' + x}>
              {x + axisUnit}
            </text>
          )}
        </g>
      </svg>
    );
  }
}
