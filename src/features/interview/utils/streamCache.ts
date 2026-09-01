export const streamCache = {
  cameraStream: null as MediaStream | null,
  
  setCameraStream(stream: MediaStream) {
    this.cameraStream = stream;
  },
  
  clearCameraStream() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }
};
