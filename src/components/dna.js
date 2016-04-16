import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';

const DNA = React.createClass({
  getDefaultProps () {
    return {
      // sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTA'
      sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTATATGTATACGAATGGAAAAATTTATCCGAATCTC'
    }
  },

  render () {
    return (
      <div>
        <a-scene>
          {this._renderSection()}
          {this._renderSection(`0 5 -5`, `0 37 110`)}
          {this._renderSection(`0 -2.5 0`, `0 72 0`)}
          {this._renderSection(`15 -1 0`, `0 25 -20`)}
        </a-scene>
      </div>
    );
  },

  _renderSection (_position, _rotation) {
    const seqFns = {
      a: this._renderA,
      t: this._renderT,
      c: this._renderC,
      g: this._renderG
    };
    let x = -(this.props.sequence.length / 2) * STEP_FACTOR_X;
    let y = 2;
    let r = 0;
    const DEG_PER_WIGGLE = 2;
    const bpNodes = this.props.sequence.split('').map( (d, i) => {
      let bp = d.toLowerCase();
      let bpSequenceFn = seqFns[bp];
      let bpNode = bpSequenceFn(i);
      x += STEP_FACTOR_X;
      r += STEP_FACTOR_R;
      // rotate strand
      if (r > 360) {
        r = 0;
      }
      return <a-entity key={`bp${i}`} rotation={`${r} 0 0`} position={`${x} ${y} 0`}>{bpNode}</a-entity>;
    });
    _position = _position || '0 0 0';
    _rotation = _rotation || '0 0 0';
    return (
      <a-entity position={_position}  rotation={_rotation}>
        {bpNodes}
      </a-entity>
    );
  },

  _getPlusOuterPos () {
    let p = SIZE / 2;
    return `0 -${p} 0`;
  },

  _getMinusOuterPos () {
    let p = SIZE / 2;
    return `0 ${p} 0`;
  },

  _getPlusInnerPos () {
    let p = SIZE / 4;
    return `0 -${p} 0`;
  },

  _getMinusInnerPos () {
    let p = SIZE / 4;
    return `0 ${p} 0`;
  },

  _renderA (coord) {
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={A_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={T_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  _renderT (coord) {
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={T_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={A_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  _renderC (coord) {
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={C_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={G_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },

  _renderG (coord) {
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
        <a-cylinder position={this._getPlusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={G_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={C_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos()} radius={SIZE / 10} color={B_COLOR}></a-sphere>
      </a-entity>
    );
  },
});

const mapStateToProps = (_state) => {
  let state = _state.dnaSceneReducer;
  return {
    promoterPos: state.promoterPos,
    mRNAPos: state.mRNAPos
  };
};

const AnimatedDNA = connect(
  mapStateToProps
)(DNA);

export default AnimatedDNA;

// bp colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';
const B_COLOR = '#3499FB';

const SIZE = 0.75;
const STEP_FACTOR_X = SIZE / 3;
const STEP_FACTOR_R = 22;
