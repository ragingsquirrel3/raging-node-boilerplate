import _ from 'underscore';
const DEFAULT_STATE = {
  promoterPos: 0,
  mRNAPos: -4,
};

const dnaSceneReducer = (_state, action) => {
  let state = _.clone(_state);
  switch (action.type) {
    case 'INCREMENT_TRANSCRIPTION':
      let value = (typeof action.value === 'number') ? action.value : 1
      state.mRNAPos += value;
      if (state.mRNAPos > 40) state.mRNAPos = 0;
      return state;
    default:
      return DEFAULT_STATE;
  }
};

export default dnaSceneReducer;