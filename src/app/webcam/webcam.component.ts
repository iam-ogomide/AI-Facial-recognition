import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';

interface DetectedFace {
  box: any; 
  age: number;
  gender: string;
  expressions: faceapi.FaceExpressions; 
  name?: string; 
}

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css'],
})
export class WebcamComponent implements OnInit {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  detectedFaces: DetectedFace[] = [];
  stream: MediaStream | undefined;

  ngOnInit(): void {
    this.loadFaceApiModels();
    this.startWebcam();
  }

  // Load face-api.js models
  async loadFaceApiModels() {
    const MODEL_URL = 'assets/models'; 

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
  }

  // Start the webcam stream
  async startWebcam() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      this.video.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  }

  // Capture the image from the webcam
  captureImage() {
    const canvasElement = this.canvas.nativeElement;
    const context = canvasElement.getContext('2d');
    context?.drawImage(this.video.nativeElement, 0, 0, canvasElement.width, canvasElement.height);
    this.detectFacesFromImage();
  }

  // Detect faces from the captured image
  async detectFacesFromImage() {
    const img = this.canvas.nativeElement;
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender()
      .withFaceExpressions();

    this.detectedFaces = detections.map(detection => ({
      box: detection.detection.box,
      age: detection.age,
      gender: detection.gender,
      expressions: detection.expressions,
      name: "Trial Name" 
    }));
  }

  // Check if a value is a number
  isNumber(value: any): value is number {
    return typeof value === 'number';
  }

  // Stop the webcam stream
  stopWebcam() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
