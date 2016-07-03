import React from 'react';
import d3 from 'd3';

const WIDTH = 960;
const HEIGHT = 960;
const PADDING = 50;

const ChordDiagram = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array,
    edges: React.PropTypes.array
  },

  render () {
    return (
      <div>
        <svg ref='svg' width={WIDTH} height={HEIGHT}>
          <g ref='nodeTarget' className='node-target' transform='translate(300,300)'/>
        </svg>
      </div>
    );
  },

  componentDidMount() {
    this._renderSVG();
  },

  // d3-fu like https://bl.ocks.org/mbostock/7607999
  _renderSVG () {
    // create layout functions
    var diameter = 460,
      radius = diameter / 2,
      innerRadius = radius - 120;
    var cluster = d3.layout.cluster()
      .size([360, innerRadius])
      .sort(null)
      .value(function(d) { return d.size; });
    var bundle = d3.layout.bundle();
    var line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.85)
      .radius(function(d) { return d.y; })
      .angle(function(d) { return d.x / 180 * Math.PI; });
    // prepare data
    var nodesData = cluster.nodes({ name: '', children: this.props.nodes });
    // d3 DOM rendering
    var nodeTarget = d3.select(this.refs.nodeTarget);
    var node = nodeTarget.selectAll('.text-node')
      .data(nodesData.filter(function(n) { return !n.children; }))
    .enter().append("text")
      .attr("class", "text-node")
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.name; })
  }
});

export default ChordDiagram;
