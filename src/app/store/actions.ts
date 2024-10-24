import { createAction, props } from '@ngrx/store';

// Action to capture image
export const captureImage = createAction(
  '[Webcam] Capture Image',
  props<{ image: string }>()
);

// Action to detect faces
export const detectFaces = createAction(
  '[Webcam] Detect Faces',
  props<{ faces: any[] }>()
);
