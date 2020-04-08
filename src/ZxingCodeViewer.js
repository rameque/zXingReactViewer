import { BrowserPDF417Reader, BrowserQRCodeReader } from '@zxing/library';
import React, { Component } from 'react';

const codeReader = new BrowserQRCodeReader();
const codeReaderDNI = new BrowserPDF417Reader();

class ZxingCodeViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: 'http://placehold.it/314x222',
      result: ['No result'],
      resultImage: ['No result'],
      imageAvailable: false
    }

    this.textInput = React.createRef();
    this.ImageScan = React.createRef();
    codeReader.reset();
    codeReaderDNI.reset();
  }

  scanFromImage(type) {
    let result;
    let reader = (type) ? codeReaderDNI : codeReader;
    if (this.state.imageAvailable) {
      result = reader.decodeFromImage(this.ImageScan.current)
      result.then(rst => this.writeResultImage(rst)).catch(err => console.error(err))
    }
  }

  scanFromVideo(type) {
    let reader = (type) ? codeReaderDNI : codeReader;
    reader.listVideoInputDevices()
      .then(videoInputDevices => {
        videoInputDevices.forEach(device => {
          this.decodeFromVideo();
        });
      })
      .catch(err => console.error(err));
  }

  writeResultImage(response) {
    this.setState({
      resultImage: response.text.split('@')
    })
  }

  writeResult(response) {
    this.setState({
      result: response.text
    })
  }

  decodeFromVideo(type) {
    let reader = (type) ? codeReaderDNI : codeReader;
    reader.decodeFromInputVideoDeviceContinuously(undefined, 'video', (result, err) => this.callbackDecodingVideo(result, err))
      .then(result => console.log(result))
      .catch(err => console.error(err));

  }

  callbackDecodingVideo(result, err) {
    let resultText = '';
    let infoFounded = false;
    if (result) {
      infoFounded = true;
    } else {
      if (err) {
        resultText = 'Trying to Decode:' + err;
      }
    }

    console.log(resultText);

    if(infoFounded){
      this.stopContinuousDecode();
      this.writeResult(result);
    }
  }

  stopContinuousDecode() {
    codeReaderDNI.stopContinuousDecode();
    codeReaderDNI.stopStreams();

    codeReader.stopContinuousDecode();
    codeReader.stopStreams();

    codeReader.reset();
    codeReaderDNI.reset();
  }


  render() {
    return (<>
      <div className="block">
        <h2>Video</h2>
        <video id="video" width="310" height="220" className="video"></video>
        <div className="buttons">
          <div className="wrapButtons">
            <button onClick={this.scanFromVideo.bind(this)} className="run">SCAN QRCODE</button>
            <button onClick={this.scanFromVideo.bind(this, 'DNI')} className="run">SCAN DNI</button>
          </div>
          <button onClick={this.stopContinuousDecode.bind(this)} className="stop">STOP</button>
        </div>
        <div className="logger">
          {this.state.result}
        </div>
      </div>
      <hr />
      <div className="block">
        <h2>Image</h2>
        <input className="fileHiden" type="file" ref={this.textInput} onChange={this.readURL.bind(this)}></input>
        <div className="wrapper-image" onClick={this.forceOpenFile.bind(this)}>
          <img src={this.state.file} alt="imgSrc" ref={this.ImageScan}></img>
        </div>
        <div>
          <button onClick={this.scanFromImage.bind(this)}>SCAN DNI FROM IMAGE</button>
        </div>
        <div>{this.state.resultImage.map((text, index) => (<p key={index}>{text}</p>))}</div>
      </div>
    </>)
  }

  forceOpenFile() {
    this.textInput.current.click();
  }

  readURL(event) {
    this.setState({
      imageAvailable: true,
      file: URL.createObjectURL(event.target.files[0])
    })
  }
}

export default ZxingCodeViewer;

 // use this path since v0.5.1

