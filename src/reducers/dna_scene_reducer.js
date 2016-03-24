import _ from 'underscore';
const DEFAULT_STATE = {
  promoterPos: 0,
  mRNAPos: -4,
};

const dnaSceneReducer = (_state, action) => {
  let state = _.clone(_state);
  switch (action.type) {
    case 'INCREMENT_TRANSCRIPTION':
      state.mRNAPos ++;
      return state;
    default:
      return DEFAULT_STATE;
  }
};

export default dnaSceneReducer;