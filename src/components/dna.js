import _ from 'underscore';
import React from 'react';

const DNA = React.createClass({
  getDefaultProps () {
    return {
      sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATC',
      steps: [
        {
          imgSrc: 'img/lorem.png'
        },
        {
          imgSrc: 'img/lorem.png'
        },
        {
          imgSrc: 'img/lorem.png'
        }
      ]
    }
  },

  getInitialState() {
    return {
      currentStep: 0,
      rnaPolPos: `-0.1 8 0`,
      rnaPolCoord: 14
    };
  },

  // decrease until end then reloop
  _incrementStep (e) {
    let newStep = this.state.currentStep + 1;
    if (newStep > this.props.steps.length) newStep = 0;
    this.setState({ currentStep: newStep });
  },

  render () {
    console.log(this.state.currentStep)
    // console.log('posL ', this.state.rnaPolPos, ' coord: ', this.state.rnaPolCoord)
    return (
      <div onClick={this._incrementStep}>
        <a-scene>
          {this._renderBillboard()}
          {this._renderSection(`-2 0 0`)}
          {this._renderSection(`-0.25 0 -5`, `0 37 110`)}
          {this._renderRNAPol()}
          <a-sky color='#272822' />
        </a-scene>
      </div>
    );
  },

  componentDidUpdate(prevProps, prevState) {
    // if 0 -> 1 animate rnaPolPos
    if (this.state.currentStep === 1 && prevState.currentStep === 0) {
      let currentPos = this.state.rnaPolPos;
      let currentY = parseInt(currentPos.split(' ')[1]);
      const END_Y = 1.75;
      this._interpolateNumber(currentY, END_Y, 1000, val => {
        this.setState({ rnaPolPos: `-0.1 ${val} 0` });
      });
    }
    // if 1 -> 2 animate rnaPolCoord to go along DNA
    // reset cleanup
    if (this.state.currentStep === 0 && prevState.currentStep > 0) {
      this.setState({ rnaPolPos: `-0.1 8 0` });
      if (this.interTimer) clearInterval(this.interTimer);
    }
  },

  // cb(val)
  _interpolateNumber(start, end, duration, cb) {
    const STEPS = 20;
    if (this.interTimer) clearInterval(this.interTimer);
    let current = start;
    let stepValue = (end - start) / STEPS;
    let isUp = (end > start);
    this.interTimer = setInterval( () => {
      current += stepValue;
      cb(current);
      let isFinished = ((isUp && current >= end) || (!isUp && current <= end));
      if (isFinished) {
        cb(end);
        clearInterval(this.interTimer);
      }
    }, duration / STEPS);
  },

  _renderSection (_position, _rotation) {
    let x = -(this.props.sequence.length / 2) * STEP_FACTOR_X;
    let y = 2;
    let r = 0;
    const bpNodes = this.props.sequence.split('').map( (d, i) => {
      let bpNode = this._renderBasePair(d);
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

  _renderRNAPol () {
    if (this.state.currentStep < 1) return null;
    return (
      <a-entity position={this.state.rnaPolPos}>
        <a-sphere radius={0.5} color={RNA_POL_COLOR} />
      </a-entity>
    );
  },

  _renderBillboard () {
    // TEMP nothin
    return null;
    if (this.state.currentStep < 2) return null;
    let currentStepD = this.props.steps[this.state.currentStep - 1];
    let _src = currentStepD.imgSrc;
    let _position = currentStepD.position || DEFAULT_BILLBOARD_POSITION;
    return <a-image position={_position} width='9' height='9' id='billboard-img' src={_src} />;
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

  _renderBasePair (seqChar) {
    seqChar = seqChar.toLowerCase();
    // select primary and complementary nucleic acid colors from character
    let p, c;
    switch (seqChar) {
      case 'a':
        p = A_COLOR;
        c = T_COLOR;
        break;
      case 't':
        p = T_COLOR;
        c = A_COLOR;
        break;
      case 'c':
        p = C_COLOR;
        c = G_COLOR;
        break;
      case 'g':
        p = G_COLOR;
        c = C_COLOR;
        break;
    }
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos()} radius={SIZE / 10} color={B_COLOR} />
        <a-cylinder position={this._getPlusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={p} />
        <a-cylinder position={this._getMinusInnerPos()} radius={SIZE / 20} height={SIZE / 2} open-ended="false" color={c} />
        <a-sphere position={this._getMinusOuterPos()} radius={SIZE / 10} color={B_COLOR} />
      </a-entity>
    );
  }
});

export default DNA;

//  colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';
const B_COLOR = '#3499FB';
const RNA_POL_COLOR = '#E85379';

const DEFAULT_BILLBOARD_POSITION = '0 1 -2';
const SIZE = 0.75;
const STEP_FACTOR_X = SIZE / 3;
const STEP_FACTOR_R = 22;
