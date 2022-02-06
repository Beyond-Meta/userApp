import React, { Component } from "react";
import './App.css';

import Web3 from "web3";
import getWeb3 from "./getWeb3";

import {
  Button,
  Container,
  Row,
  Col,
  ListGroupItem,
  ListGroup,
  Modal, ModalBody
} from "reactstrap";

import QrReader from "react-qr-reader";

class App extends Component {

  state = { 
    web3: null, coinbase: null, 
    chain: "eth", chainId: 3, // ropsten
    relayerJsonInterface: {
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
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_fee",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_timeStamp",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },

    ethProvider: null, ethContractAddress: "0x88FB8FBB448A64CB2d35630811ED9CF6ebF518B6", 
    ethTimestamp: 0, ethSignature: "", ethRelayer: "",

    maticProvider: null, maticContractAddress: "0x88FB8FBB448A64CB2d35630811ED9CF6ebF518B6", 
    maticTimestamp: 0, maticSignature: "", maticRelayer: "",

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
      
      // Set MATIC Provider
      const polygon = new Web3.providers.HttpProvider(
        "https://rpc-mumbai.matic.today"
      );
      const maticProvider = new Web3(polygon);

      // Set Relayer MATIC Wallet
      const maticWalletInstance = maticProvider.eth.accounts.privateKeyToAccount(
        "0xc90785fea3756615dab8e002d0352de89341321c4a12ae352bd3ed444a43fd20"
      );
      maticProvider.eth.accounts.wallet.add(maticWalletInstance);
      
      const maticRelayer = maticProvider.eth.accounts.wallet[0].address;
    
      this.setState(
        { 
          web3, 
          coinbase: accounts[0], 
          ethProvider, ethRelayer,
          maticProvider, maticRelayer
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

  sign = async (chain, jsonInterface, inputParams) => {

    const { web3, coinbase } = this.state

    const timestamp = new Date().getTime();
    const recipient = inputParams[0]
    const amount = web3.utils.toWei(String(inputParams[1]))
    
    const data = web3.eth.abi.encodeFunctionCall(jsonInterface, [recipient, amount]);

    const hex =
      data + web3.utils.padLeft(web3.utils.toHex(timestamp), 64).slice(2);

    switch(chain){
      case 'eth':
        web3.eth.personal
          .sign(web3.utils.keccak256(hex), coinbase)
          .then(signature => { 
            console.log(timestamp, signature)
            this.setState({ ethTimestamp: timestamp, ethSignature: signature }, ()=>{this.metaTx(chain, recipient, amount)})
          })
      break;
      case 'polygon':
        web3.eth.personal
          .sign(web3.utils.keccak256(hex), coinbase)
          .then(signature => { 
            console.log(timestamp, signature)
            this.setState({ maticTimestamp: timestamp, maticSignature: signature }, ()=>{this.metaTx(chain, recipient, amount)})
          })
      break;
    }
  }

  
  metaTx = async (chain, recipient, amount) => {
    console.log('metaTx: ' + chain)
    const { coinbase, relayerJsonInterface } = this.state
    let data, gas, fee;
    const self = this;

    switch(chain){
      case 'eth':
        const { ethProvider, ethSignature, ethTimestamp, ethContractAddress, ethRelayer} = this.state
        fee = ethProvider.utils.toWei("10")

        console.log([ethSignature, coinbase, recipient , amount, fee, ethTimestamp])

        data = ethProvider.eth.abi.encodeFunctionCall(relayerJsonInterface, [
          ethSignature,
          coinbase,
          recipient, // Bob's address
          amount,
          fee,
          ethTimestamp
        ]);
    
        gas = await ethProvider.eth.estimateGas({
          from: ethRelayer,
          to: ethContractAddress,
          data,
        })
        
        ethProvider.eth.sendTransaction({
          from: ethRelayer,
          to: ethContractAddress,
          data,
          gas: parseInt(gas * 1.5)
        })
        .on('transactionHash', function(hash){
          console.log('txhash: '+hash)
          self.toggleModal("https://ropsten.etherscan.io/tx/"+hash)
        })
        .on('receipt', function(receipt){
          console.log(receipt)
          self.setState({modal:false, display:'none'})
        })
        
      break;
      case 'polygon':
        const { maticProvider, maticSignature, maticTimestamp, maticContractAddress, maticRelayer} = this.state
        fee = maticProvider.utils.toWei("10")
        
        console.log([maticSignature, coinbase, recipient , amount, fee, ethTimestamp])

        data = maticProvider.eth.abi.encodeFunctionCall(relayerJsonInterface, [
          maticSignature,
          coinbase,
          recipient,
          amount,
          fee,
          maticTimestamp
        ]);
    
        gas = await maticProvider.eth.estimateGas({
          from: maticRelayer,
          to: maticContractAddress,
          data
        })
        
        maticProvider.eth.sendTransaction({
          from: maticRelayer,
          to: maticContractAddress,
          data,
          gas: parseInt(gas * 1.5)
        })
        .on('transactionHash', function(hash){
          console.log('txhash: '+hash)
          self.toggleModal("https://mumbai.polygonscan.com/tx/"+hash)
        })
        .on('receipt', function(receipt){
          console.log(receipt)
          self.setState({modal:false, display:'none'})
        })
        
      break;
    }
  }

  onCamera = () => {
    this.setState({ camera: true });
  };

  handleScan = data => {
    if (data) {
      let params = JSON.parse(data);
      console.log(params)
      this.setState({ camera: false}, ()=>{ 
        this.sign(params.chain, params.jsonInterface, params.inputs) 
      })
    }
  };

  handleError = err => {
    console.error(err);
  };

  
  toggleModal = (url) => {

    let display = this.state.display

    display == 'none' ? display = 'block': display = 'none';

    this.setState({
      modal: !this.state.modal,
      url,
      display
    });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
            <div className="" style={{marginTop: '100px', marginBottom: '0px'}}>
              
              <Container>
                      <Row>
                        <Col className="text-center">
                          <h4 className="text-uppercase">SCAN QR CODE</h4>
                          <hr className="line-info" />
                        </Col>
                      </Row>
                      <Row>
                        <ListGroup>
                          <ListGroupItem>
                            <Button
                              className="btn-simple"
                              color="info"
                              onClick={() => {
                                this.onCamera();
                              }}
                            >
                              CAMERA ON
                            </Button>
                          </ListGroupItem>
                        </ListGroup>
                      </Row>
                    <div className="text-center">
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
                    </div>
               
              </Container>
              
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
