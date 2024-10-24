import { ActionReducerMap, createReducer, on, Action } from '@ngrx/store';
import { captureImage, detectFaces } from './actions';

// Define the state structure
export interface AppState {
  capturedImage: string | null;
  detectedFaces: any[];
}

// Initial state
export const initialState: AppState = {
  capturedImage: null,
  detectedFaces: []
};

// Create the reducer with explicit typing
const _appReducer = createReducer(
  initialState,
  on(captureImage, (state, { image }) => ({ ...state, capturedImage: image })),
  on(detectFaces, (state, { faces }) => ({ ...state, detectedFaces: faces }))
);

// Exported reducer function with typed 'state' and 'action'
export function appReducer(state: AppState | undefined, action: Action) {
  return _appReducer(state, action);
}

// Export the reducers for StoreModule
export const reducers: ActionReducerMap<any> = {
  appState: appReducer
};
