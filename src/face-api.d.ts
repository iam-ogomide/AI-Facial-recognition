import * as faceapi from 'face-api.js';

declare module 'face-api.js' {
  export interface WithExpressions {
    expressions: {
      [key: string]: number; // Emotion names as keys with confidence scores
    };
  }

  export interface DetectedFace extends WithExpressions {
    detection: FaceDetection;
    landmarks: FaceLandmarks68;
    age: number;
    gender: string;
  }
}