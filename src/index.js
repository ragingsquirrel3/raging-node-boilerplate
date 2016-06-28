import React from 'react';
import d3 from 'd3';

const WIDTH = 960;
const HEIGHT = 960;

const ChordDiagram = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array,
    edges: React.PropTypes.array
  },

  render () {
    return (
      <div>
        <svg ref='svg' width={WIDTH} height={HEIGHT} />
      </div>
    );
  },

  componentDidMount() {
    this._renderSVG();
  },

  _renderSVG () {
    let outerRadius = Math.min(WIDTH, HEIGHT) * 0.5 - 40;
    let innerRadius = outerRadius - 30;

    let chord = d3.svg.chord();
    let arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
  }
});

export default ChordDiagram;
