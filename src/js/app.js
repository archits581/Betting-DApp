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
    $.getJSON("Betting.json", async function(BettingContract) {
      // const id = await web3.eth.net.getId();
      const deployedNet = BettingContract.networks[5777];
      const contract = TruffleContract(BettingContract);
      contract.setProvider(web3.currentProvider);
      console.log(contract);
      console.log(contract.getTeamName("0"));
    });
    // return App.getTeams();
  },

  // getTeams: function(contract) {
  //   console.log(contract.methods.getTeamName.call(0));
  // },


}


$(window).on('load', function() {
  App.init();
});