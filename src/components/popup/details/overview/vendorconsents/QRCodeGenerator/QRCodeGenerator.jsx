import { h, Component } from 'preact';
import QRCode from 'qrcode.react';




class QRCodeGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.initialUrl || '', // Set an initial URL if provided
    };
  }

  updateUrl = (newUrl) => {
    this.setState({ url: newUrl });
  };

  render() {
    const { url } = this.state;

    return (
      <div>
        <QRCodeGenerator url={url} />
      </div>
    );
  }
}

export default QRCodeGenerator;