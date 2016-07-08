import React from 'react';
import d3 from 'd3';

const ChordDiagram = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array,
    edges: React.PropTypes.array
  },

  render () {
    var svgSize = this.state.DOMSize || 100;
    var halfSize = svgSize / 2;
    return (
      <div ref='target' style={{ width: '100%', height: '100%' }}>
        <svg ref='svg' width={svgSize} height={svgSize}>
          <g ref='nodeTarget' className='node-target' transform={`translate(${halfSize},${halfSize})`}/>
        </svg>
      </div>
    );
  },

  getInitialState() {
    return {
      DOMSize: null
    };
  },

  componentDidMount() {
    this._calculateDOMSize();
  },

  componentDidUpdate(prevProps, prevState) {
    this._renderSVG();
  },

  _calculateDOMSize () {
    var rect = this.refs.target.getBoundingClientRect();
    var size = Math.min(rect.width, rect.height)
    this.setState({ DOMSize: size });
  },

  // d3-fu like https://bl.ocks.org/mbostock/7607999
  _renderSVG () {
    var size = this.state.DOMSize;
    if (!size) return;
    // create layout functions
    var diameter = size,
      radius = diameter / 2,
      innerRadius = radius - 75;
    var cluster = d3.layout.cluster()
      .size([360, innerRadius])
      .sort(null)
      .value(function(d) { return d.size; });
    var bundle = d3.layout.bundle();
    var line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(0.85)
      .radius(function(d) { return d.y; })
      .angle(function(d) { return d.x / 180 * Math.PI; });
    // prepare data
    var nodesData = cluster.nodes({ name: '', children: this.props.nodes });
    var links = this._packageEdges();
    // d3 DOM rendering
    var nodeTarget = d3.select(this.refs.nodeTarget);
    var node = nodeTarget.selectAll('.text-node')
      .data(nodesData.filter(function(n) { return !n.children; }))
    node
      .enter().append("text")
      .attr("class", "text-node");
    node.exit().remove();
    node.transition()
      .attr({
        dy: ".31em",
        transform: function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); }
      })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.name; });
    var link = nodeTarget.selectAll('.link-node')
      .data(bundle(links));
    link.enter().append("path")
      .attr({
        "class": "link-node",
        fill: "none",
        stroke: "steelblue",
        "stroke-dasharray": `${size} ${size}`,
        "stroke-dashoffset": size,
        d: line
      });
    link.exit().remove();
    link.transition().duration(1000)
      .attr({
        "stroke-dasharray": `${size} 0`,
        "stroke-dashoffset": 0,
        d: line
      });
  },

  _packageEdges () {
    return this.props.edges.map( (d, i) => {
      return { source: this._findNodeById(d.source), target: this._findNodeById(d.target) };
    });
  },

  _findNodeById (id) {
    for (var i = this.props.nodes.length - 1; i >= 0; i--) {
      let thisNode = this.props.nodes[i];
      if (thisNode.id === id) return thisNode;
    }
    return null;
  }

});

export default ChordDiagram;
