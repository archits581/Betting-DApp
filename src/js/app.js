const Web3 = require('web3');

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    console.log('init');
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    web3.eth.defaultAccount = web3.eth.accounts[1];
    console.log(web3.eth.defaultAccount);
    web3.eth.getBlockNumber(function(error, result){ 
      if (!error)
        console.log("block number => ", result)
    });
    var version = web3.version.api;
    console.log(version);
    ethereum.enable();
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Betting.json", function(bet_ins) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Betting = TruffleContract(bet_ins);
      // Connect provider to interact with contract
      App.contracts.Betting.setProvider(App.web3Provider);

      return App.getTeams();
    });
  },

  getTeams: async function() {
    var bettingInstance;
    var loader = $("#loader");

    // Load account data
    // web3.eth.getCoinbase(function(err, account) {
    //   if (err === null) {
    //     App.account = account;
    //     console.log(App.account);
    //   }
    // });

    App.account1 = web3.eth.accounts[2];
    App.account2 = web3.eth.accounts[3];

    var instance = await App.contracts.Betting.deployed()
    var teamName = await instance.getTeamName("0");
    var name = await teamName.toString();
    // console.log(name);

    var bal = await web3.eth.getBalance(instance.address);
    var balance = await bal.toNumber();
    console.log(balance);

    await instance.bid("0", {value: web3.toWei(1, 'ether'), from: App.account1});
    var check = await instance.getTeamBids("1");
    var check_ans = await check.toNumber();
    console.log(check_ans);

    await instance.bid("1", {value: web3.toWei(1, 'ether'), from: App.account2});
    var check = await instance.getTeamBids("1");
    var check_ans = await check.toNumber();
    console.log(check_ans);
    
    var bal = await web3.eth.getBalance(instance.address);
    var balance = await bal.toNumber();
    console.log(balance);

    await instance.getWinner("1");

    // Load contract data
    // App.contracts.Betting.deployed().then(function(instance) {
    //   bettingInstance = instance;
    //   bettingInstance.getTeamName("1").then(name => console.log(name));
    // });




  },

}


$(window).on('load', function() {
  App.init();
});