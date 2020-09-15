const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach( async () => {

    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0] , gas: '1000000'});

});

describe('Lottery', () => {
    
    it('deploys successfully', () => {

        assert.ok(lottery.options.address);

    });

    it('multiple accounts can enter', async () => {
        
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.011', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.011', 'ether')
        });

        const players = await lottery.methods.playerList().call({
            from: accounts[0]
        });
        
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(2, players.length);
        
    });

    it('min ether requirement', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            // fail test
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('choose winner can only be called by the creator', async () => {
        try {
            await lottery.methods.chooseWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('money sent then reset', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initBal = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.chooseWinner().send({
            from: accounts[0]
        });

        const newBal = await web3.eth.getBalance(accounts[0]);

        const reward = newBal - initBal;
        
        console.log('Reward', reward);

        assert(reward > web3.utils.toWei('1.9', 'ether'));

    });
});