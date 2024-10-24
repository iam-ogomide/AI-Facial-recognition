import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent implements AfterViewInit {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  isWebcamActive = false;
  detectedFaces: any[] = [];

  async ngAfterViewInit() {
    await this.loadFaceApiModels();
    this.startWebcam();
  }

  async loadFaceApiModels() {
    const MODEL_URL = 'assets/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  }

  startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
        this.isWebcamActive = true;
        this.detectFaces();
      })
      .catch(err => {
        console.error('Error accessing webcam: ', err);
      });
  }

  stopWebcam() {
    this.isWebcamActive = false;
    const stream = this.video.nativeElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  async detectFaces() {
    const canvas = faceapi.createCanvasFromMedia(this.video.nativeElement);
    document.body.append(canvas);
  
    const context = canvas.getContext('2d');
  
    // Check if the context is not null before proceeding
    if (!context) {
      console.error("Failed to get canvas context.");
      return; // Exit if the context is null
    }
  
    faceapi.matchDimensions(canvas, { width: this.video.nativeElement.width, height: this.video.nativeElement.height });
  
    const detectFacesLoop = async () => {
      const detections = await faceapi.detectAllFaces(this.video.nativeElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withAgeAndGender();
  
      const resizedDetections = faceapi.resizeResults(detections, { width: this.video.nativeElement.width, height: this.video.nativeElement.height });
      canvas.width = this.video.nativeElement.width;
      canvas.height = this.video.nativeElement.height;
  
      // Ensure that the context is still valid before drawing
      if (context) {
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections as faceapi.WithFaceExpressions<faceapi.WithAge<faceapi.WithGender<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }, faceapi.FaceLandmarks68>>>>[]);
  
        this.detectedFaces = resizedDetections.map(detection => ({
          box: detection.detection.box,
          age: detection.age,
          gender: detection.gender
        }));
      }
  
      requestAnimationFrame(detectFacesLoop);
    };
  
    detectFacesLoop();
  }
  captureImage() {
    const canvasElement = this.canvas.nativeElement;
    
    // Get the context of the canvas
    const context = canvasElement.getContext('2d');
  
    // Check if the context is valid (not null)
    if (!context) {
      console.error("Failed to get canvas context.");
      return; // Exit the function if context is null
    }
  
    // Draw the video frame onto the canvas
    context.drawImage(this.video.nativeElement, 0, 0, canvasElement.width, canvasElement.height);
  
    // Optionally, you can retrieve the image data from the canvas
    const imageData = canvasElement.toDataURL('image/png'); // or 'image/jpeg'
    console.log('Captured Image Data URL:', imageData);
  
    // Here you can also handle further actions with the imageData, such as sending it to a server or displaying it
  }
}