import { combineReducers } from 'redux';
import dnaSceneReducer from './dna_scene_reducer';

const dnaApp = combineReducers({
	dnaSceneReducer
});

export default dnaApp;
