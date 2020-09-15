import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import coinlotto from './coinlotto';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      creator: '', 
      players: [],
      balance: '',
      value: '',
      message: '',
      lastWinner: '',
    };
  }

  async componentDidMount() {
    const creator = await coinlotto.methods.creator().call();
    const players = await coinlotto.methods.playerList().call();
    const balance = await web3.eth.getBalance(coinlotto.options.address);
    const lastWinner = await coinlotto.methods.lastWinner().call();


    this.setState({ 
      creator: creator, 
      players: players, 
      balance: balance,
      lastWinner: lastWinner 
    });
  }

  handleSubmit = async (event) => {

    event.preventDefault();
 
    if (this.state.value > 0.01 === false) {
      this.setState({ message: 'The amount must be greater than 0.01 ether. Please try again' });
      return;
    }
 
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Waiting on transaction...' });
 
    try {
 
      await coinlotto.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether'),
      });
 
      this.setState({ message: 'You\'re now entered!' });
    } catch(error) {
      this.setState({ message: 'You declined to enter. Please try again.' });
    }
  }

  handleWinner = async () => {    
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Choosing a winner' })

    try {
      await coinlotto.methods.chooseWinner().send({from: accounts[0]});
      const winner = await coinlotto.methods.lastWinner().call();
      this.setState({ message: winner + 'is the winner! Refresh the page!' });

    } catch(error) {
      this.setState({message: 'Either you aren\'t the manager, or there are no players'})
    }


  }

  render() {
    return (
      <div className='text text-center'>
        <div className='jumbotron'>
          <h1>Coin Lotto</h1>
        </div>

        <div className='py-3'>
          <h2>Prize Pool: {web3.utils.fromWei(this.state.balance, 'ether')} ether</h2>
          <h5>Players currently entered: {this.state.players.length}</h5>
        </div>
        
        <hr className=''/>

        <form onSubmit={this.handleSubmit}>
          <h4>Enter</h4>
          <div>
            <label>Amount of Ether to enter: (must be greater than 0.01)</label>
            <input
              type="number"
              value={ this.state.value }
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />
        <h4>For creator only</h4>
        <button type='button' className='btn btn-dark' onClick={this.handleWinner}>Pick a winner!</button>

        <hr />
        <p>{this.state.message}</p>

      </div>
    );
  }
}

export default App;
