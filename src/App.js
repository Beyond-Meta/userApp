import React, { Component } from "react";
import './App.css';

import Web3 from "web3";
import getWeb3 from "./getWeb3";

import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  ListGroupItem,
  ListGroup,
  Modal, ModalBody
} from "reactstrap";

import QrReader from "react-qr-reader";

class App extends Component {

  state = { 
    abi: [],
    web3: null, coinbase: null, 
    chain: "eth", chainId: 3, // ropsten
    relayerJsonInterface: {
      "constant": false,
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_sig",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_timeStamp",
          "type": "uint256"
        }
      ],
      "name": "setOwner",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },

    ethProvider: null, ethContractAddress: "", 
    ethContractInstance: null, ethTimestamp: 0, ethSignature: "", ethRelayer: "",

    maticProvider: null, maticContractAddress: "", 
    maticContractInstance: null, maticTimestamp: 0, maticSignature: "", maticRelayer: "",

    modal: false,
    url: "",
    display: "none",
    qrResult: "No result",
    camera: false
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      const self = this  
      window.ethereum.on("accountsChanged", function(accounts) {
        self.setState({ coinbase: accounts[0] });
      });

      // Set ETH Provider
      const eth = new Web3.providers.HttpProvider(
        "https://ropsten.infura.io/v3/b2ad306cee024ab0a9059f807b86ae53"
      );
      const ethProvider = new Web3(eth);

      // Set Relayer ETH Wallet
      const ethWalletInstance = ethProvider.eth.accounts.privateKeyToAccount(
        "0xc90785fea3756615dab8e002d0352de89341321c4a12ae352bd3ed444a43fd20"
      );
      ethProvider.eth.accounts.wallet.add(ethWalletInstance);
      
      const ethRelayer = ethProvider.eth.accounts.wallet[0].address;
      
      // Set ETH contract
      const ethContractInstance = new ethProvider.eth.Contract(
        this.state.abi,
        this.state.ethContractAddress
      );
      
      this.setState(
        { 
          web3, 
          coinbase: accounts[0], 
          ethContractInstance, ethProvider, ethRelayer
          // maticContractInstance, maticProvider, maticRelayer, maticRelayerBalance, maticOwner
        }
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  
  onCamera = () => {
    this.setState({ camera: true });
  };

  handleScan = data => {
    if (data) {
      console.log(typeof data);
      let params = JSON.parse(data);
      console.log(params)
      // this.sign(params.chain, params.jsonInterface, params.inputs)
    }
  };

  handleError = err => {
    console.error(err);
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="wrapper">
          <div className="">
            <div className="" style={{margin: '100px', marginBottom: '0px'}}>
              
              <Container>
                <Row>
                  <Card className="card-coin card-plain" style={{ minHeight: 300 }}>
                    <CardBody>
                      <Row>
                        <Col className="text-center" md="12">
                          <h4 className="text-uppercase">DEVICE QR CODE</h4>
                          <hr className="line-info" />
                        </Col>
                      </Row>
                      <Row>
                        <ListGroup>
                          <ListGroupItem>CAMERA</ListGroupItem>
                          <ListGroupItem>
                            <Button
                              className="btn-simple"
                              color="info"
                              onClick={() => {
                                this.onCamera();
                              }}
                            >
                              ON
                            </Button>
                          </ListGroupItem>
                        </ListGroup>
                      </Row>
                    </CardBody>
                    <CardFooter className="text-center">
                      {this.state.camera ? (
                        <QrReader
                          delay={300}
                          onError={this.handleError}
                          onScan={this.handleScan}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        false
                      )}
                    </CardFooter>
                  </Card>
               
                </Row>
              </Container>
              
            </div>
          </div>
        </div>
        <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Transaction sent
            </h5>
          </div>
          <ModalBody>
            <p>Please wait...</p>
            <p></p>
            <a href={this.state.url} target="_blank">View on Explorer</a>
          </ModalBody>
          {/* <ModalFooter>
            <Button color="secondary" onClick={this.toggleModalDemo}>
              Close
            </Button>
          </ModalFooter> */}
        </Modal>
        <div style={{
          display: this.state.display, /* Hidden by default */
          position: "fixed", /* Stay in place */
          zIndex: 1, /* Sit on top */
          left: 0,
          top: 0,
          width: "100%", /* Full width */
          height: "100%", /* Full height */
          overflow: "auto", /* Enable scroll if needed */
          backgroundColor: "rgb(0,0,0)", /* Fallback color */
          backgroundColor: "rgba(0,0,0,0.4)", /* Black w/ opacity */
        }}> 
        </div>
      </div>  
    );
  }
}

export default App;
