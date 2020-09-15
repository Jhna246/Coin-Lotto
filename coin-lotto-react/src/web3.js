import Web3 from 'web3';

//enable metamask on our browser
window.ethereum.enable()

// get the provider created by metamask
const web3 = new Web3(window.web3.currentProvider);

export default web3