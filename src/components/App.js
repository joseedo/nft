import React, { Component } from 'react';
import Web3 from 'web3' 
import './App.css';
import Color from '../abis/Color.json'



class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]
    if(networkData) {
      const abi = Color.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Colors
      for (var i = 1; i <= totalSupply; i++) {
        const color = await contract.methods.colors(i - 1).call()
        this.setState({
          colors: [...this.state.colors, color]
        })
      }
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  async pushIpfsData(buffer) {
    const IPFS = require('ipfs-http-client');
    const ipfs = await new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    console.log(ipfs)
    const ipfsHash = await ipfs.add(buffer)
    if(ipfsHash) {
      console.log(ipfsHash[0].hash)
      return ipfsHash[0].hash
    } else {
      alert('Ipfs file not created')
    }
  }

  async convertToBuffer(Metadata) {
    
  }

  async mint(color, name, description) {
    var Metadata = await require('../abis/metadata.json')
    console.log(Metadata)
    Metadata.name = name
    Metadata.description = description  
    const buffer = Buffer.from(Metadata.toString())
    const tokenURI = this.pushIpfsData(buffer) 

    this.state.contract.methods.mint(color, tokenURI).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ 
        colors: [...this.state.colors, color]
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      colors: [],
      TokenURIS: []
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.theboilerplante.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Color Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const color = this.color.value
                  const name = this.name.value
                  const description = this.description.value
                  this.mint(color, name, description)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='e.g. #FFFFFF'
                    ref={(input) => { this.color = input }}
                  />
                     <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Name'
                    ref={(input) => { this.name = input }}
                  />
                     <input
                    type='textarea'
                    className='form-control mb-1'
                    placeholder='Description'
                    ref={(input) => { this.description = input }}
                  />

                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className="row text-center">
            { this.state.colors.map((color, key) => {
              return(
                <div key={key} className="col-md-3 mb-3">
                  <div className="token" style={{ backgroundColor: color }}></div>
                  <div>{color}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
