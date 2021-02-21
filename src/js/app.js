
const Web3 = require('web3');


App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  matchCount: 0,
  matches: {},
  betting_instance: null,

  init: function() {
    console.log('init');
    return App.initWeb3();
  },

  initWeb3: function() {
    
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
      // App.matches[0] = App.contracts.Betting;
      App.betting_instance = bet_ins;
      
    });

    $.getJSON("Betting1.json", function(bet_ins) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Betting1 = TruffleContract(bet_ins);
      // Connect provider to interact with contract
      App.contracts.Betting1.setProvider(App.web3Provider);
      // App.matches[0] = App.contracts.Betting;
      App.betting_instance = bet_ins;
      
    });

    $.getJSON("Betting2.json", function(bet_ins) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Betting2 = TruffleContract(bet_ins);
      // Connect provider to interact with contract
      App.contracts.Betting2.setProvider(App.web3Provider);
      // App.matches[0] = App.contracts.Betting;
      App.betting_instance = bet_ins;
      return App.getAccount();
    });
  },

  getAccount: async function () {
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        console.log(App.account);
      }
    });

    App.matches[0] = await App.contracts.Betting.deployed();
    App.matches[1] = await App.contracts.Betting1.deployed();
    App.matches[2] = await App.contracts.Betting2.deployed();

    App.matchCount = 2;

    // await App.getWinner("0");
    // console.log(name1);
    // console.log(name2);

    

    if (document.getElementById('adminPage').value == 1) {
      await App.getOngoingMatches();
    } 

    if (document.getElementById('adminPage').value == 0) {

      if(document.getElementById('check') == 1) {


        let matchId = document.getElementById('match_id').value;
        let name1 = await App.getTeamsGen(App.matches[matchId], "0");
        let name2 = await App.getTeamsGen(App.matches[matchId], "1");
        let balance = await App.getContractBalance(App.matches[matchId]);
        document.getElementById('name1').innerText = name1;
        document.getElementById('name2').innerText = name2;
        document.getElementById('total_bids').innerText = balance + " ETH ";
        
      }
    }

    return App.listentoEvents();

  },

  listentoEvents: async function() {

    

    // console.log(document.getElementById('adminPage').value, document.getElementById('check').value);
    
    if(document.getElementById('adminPage').value == 0) {

      
      if (document.getElementById('check').value == 0) {

        // Multiple Matches
        $('#single_match').hide();
        
        console.log('hi');
        await App.loadMatch();

        const endButtons = document.querySelectorAll('.subBtn');
        console.log(endButtons)
        for(const btn of endButtons) {
          console.log(btn)
          btn.addEventListener('click', async (event) => {
            
            let matchId = btn.previousElementSibling.value;
            document.getElementById('check').value = 1;
            document.getElementById('matchId').value = matchId;
            return App.listentoEvents();
          })
        }
      };


      if (document.getElementById('check').value == 1) {

        $('#matches').hide();
        $('#single_match').show();

        let matchId = document.getElementById('matchId').value;
        let contract = App.matches[matchId];

        let n1 = await App.getTeamsGen(contract, "0");
        let n2 = await App.getTeamsGen(contract, "1");
        let balance = await App.getContractBalance(contract);

        document.getElementById('name1').innerText = n1;
        document.getElementById('name2').innerText = n2;
        document.getElementById('total_bids').innerText = balance;

        // Single Match
        async function bid1(contract) {
          var amount = $("#bet_team1").val();
          var bid = await App.generateBid("0", amount, contract);
          console.log(bid);
        };

        async function bid2(contract) {
          var amount = $("#bet_team2").val();
          var bid = await App.generateBid("1", amount, contract);
        } 

        $("#place_bet_team1").click( async function() {
          await bid1(contract); 
          location.reload();              
        });

        $("#place_bet_team2").click( async function() {
          await bid2(contract);
          location.reload();
        });
      }
    };


    if (document.getElementById('adminPage').value == 1) {
    
      $('#start_match_form').click( async function() {
      App.matchCount++;
      let count = App.matchCount;
      await App.contracts.Betting.defaults({from: App.account, gas: 4712388, gasPrice: 100000000000});
      
      let team1Name = document.getElementById('name1').value;
      let team2Name = document.getElementById('name2').value; 

      let inst = await App.contracts.Betting.new(team1Name, team2Name);
      App.matches[count] = inst;

      var teamName = await App.matches[count].getTeamName("0");
      var name = await teamName.toString();
      console.log(name);
      await App.getOngoingMatches();
    });

    const endButtons = document.querySelectorAll('.endBtn');
    console.log(endButtons)
    for(const btn of endButtons) {
      console.log(btn)
      btn.addEventListener('click', async (event) => {
        
        let matchId = btn.previousElementSibling.value;
        let inId = matchId + "_input";

        let winner = document.getElementById(inId).value;

        await App.matches[matchId].getWinner(winner);
        
        event.preventDefault();
      })
    }
    } 

    if(document.getElementById('adminPage').value == 2) {
      await App.loadAdminMatches();

      const endButtons = document.querySelectorAll('.subBtn');
      console.log(endButtons)
      for(const btn of endButtons) {
        console.log(btn)
        btn.addEventListener('click', async (event) => {
          
          let matchId = btn.previousElementSibling.value;
          let name1 = "name" + matchId + "_1";
          let name2 = "name" + matchId + "_2";

          console.log(name1, name2);

          let n1 = document.getElementById(name1).innerText;
          let n2 = document.getElementById(name2).innerText;

          console.log(n1, n2);

          await App.startMatch(n1, n2);

          console.log(App.matches);
          
          event.preventDefault();
        })
      }
    }

  },

  startMatch: async function(name1, name2) {
    App.matchCount++;
    let count = App.matchCount;
    await App.contracts.Betting.defaults({from: App.account, gas: 4712388, gasPrice: 100000000000});
    
    let team1Name = name1;
    let team2Name = name2; 

    let inst = await App.contracts.Betting.new(team1Name, team2Name);
    App.matches[count] = inst;
  },

  getOngoingMatches: async function() {

    // console.log(App.matchCount);
    // App.matches[0] = await App.contracts.Betting.deployed();
    

    let component = '' 
    for(let i=0; i <= App.matchCount; i++) {
      let count = i;
      // console.log(App.matches[count]);
      let team1 = await App.matches[count].getTeamName("0");
      let team1_name = await team1.toString();

      let team2 = await App.matches[count].getTeamName("1");
      let team2_name = await team2.toString();

      // let balance = await App.matches[count].getContractBalance();

      
      var bal = await web3.eth.getBalance(App.matches[count].address);
      var balance = await bal.toNumber();
      balance = await web3.fromWei(balance, 'ether');
      var inName = i + "_input";

      component += `
      <div class="match-card mb-5">
      <div class=row>
        <!-- Team 1 -->
        <div class="col-md-6">
          <div class="text-center">
            <h1 style="font-weight: 500">${team1}</h1>
          </div>
        </div>
        <!-- Team 2 -->
        <div class="col-md-6">
          <div class="text-center">
            <h1 style="font-weight: 500">${team2}</h1>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="text-center col-md-12">
          <h2>Score</h2>
          <p> ----->Score goes here<----- </p>
        </div>
      </div>

      <div class="row contract-row">
        <div class="text-center col-md-12">
          <div class="contract-balance" id="contract-balance">${balance} ETH </div>
        </div>
      </div>

      <div class="end-match-div">
        <form class="end-form">
          <div class="form-group col-md-4" style="margin-right: auto; margin-left: auto">
            <div class="text-center">
              <label>Enter ID of the winning team:</label>
            </div>
            <input type="number" min="0" max="1" name="" placeholder="0" class="form-control" id="${inName}">
            <br>
            <div class="text-center">
              <input type="hidden" value="${i}">
              <button class="btn btn-danger end-match-btn endBtn">End Match</button>
            </div>
          </div>
        </form>
      </div>
    </div>
      `

    document.getElementById('ongoing_matches').innerHTML = component;

    }
  
  },

  getTeamsGen: async function(contract, n) {
    var instance = contract;
    var teamName = await instance.getTeamName(n);
    var name = await teamName.toString();
    console.log(name);
    return name;
  },

  getTeams: async function(n) {

    var instance = await App.contracts.Betting.deployed()
    var teamName = await instance.getTeamName(n);
    var name = await teamName.toString();
    console.log(name);
    return name;

    // await instance.bid("0", {value: web3.toWei(5, 'ether'), from: App.account1});
    // var check = await instance.getTeamBids("1");
    // var check_ans = await check.toNumber();
    // console.log(check_ans);

    // var bid1 = await generateBid( "0", 5, 1);
    // console.log(bid1);

    // await instance.bid("1", {value: web3.toWei(5, 'ether'), from: App.account2});
    // var check = await instance.getTeamBids("1");
    // var check_ans = await check.toNumber();
    // console.log(check_ans);

    // var bid2 = await generateBid( "1", 5, 2);
    // console.log(bid2);
    
    // var bal = await web3.eth.getBalance(instance.address);
    // var balance = await bal.toNumber();
    // console.log(balance);

    // var bal = await getContractBalance();
    // console.log(bal);

    // await instance.getWinner("0");

    // await getWinner("0");
  },

  getContractBalance: async function(contract) {
    // var instance = await App.contracts.Betting.deployed();
    var instance = contract;
    var bal = await web3.eth.getBalance(instance.address);
    var balance = await bal.toNumber();
    return web3.fromWei(balance, 'ether');
  },

  generateBid: async function( teamId, amount, contract ) {

    var check_ans;

    var instance = contract;
    await instance.bid(teamId, {value: web3.toWei(amount, 'ether'), from: App.account});
    var check = await instance.getTeamBids(teamId);
    check_ans = await check.toNumber();
    console.log(check_ans);

    return App.listentoEvents();

  }, 

  checkTotalBid: async function( teamId, account ) {
    var instance = await App.contracts.Betting.deployed();
    var check = await instance.getTeamBids(teamId);
    var check_ans = await check.toNumber();
    return check_ans;
  },

  getWinner: async function( teamId ) {
    var instance = await App.contracts.Betting.deployed();
    await instance.getWinner(teamId);
  },

  loadAdminMatches: async function() {
    var matches = await App.getMatches();
    const matchesContainer = document.getElementById('matches');
    for(var i = 0; i<matches.data.matchList.matches.length; i++){
      // console.log(matches.data.matchList.matches[i]);
      if(matches.data.matchList.matches[i].awayTeam.name == "Unknown" || matches.data.matchList.matches[i].homeTeam.name == "Unknown"){
        continue;
      }
      let id = i + "_input";
      let name1 = "name" + i + "_1";
      let name2 = "name" + i + "_2";
      console.log(name1, name2);
      matchesContainer.innerHTML += 
      `<div class="match-card" id=${i}>
        <div class=row>
          <!-- Team 1 -->
          <div class="col-md-6">
            <div class="text-center">
              <h3 style="font-weight: 500" id="${name1}">${matches.data.matchList.matches[i].awayTeam.name}</h3>
            </div>
          </div>
          <!-- Team 2 -->
          <div class="col-md-6">
            <div class="text-center">
              <h3 style="font-weight: 500" id="${name2}">${matches.data.matchList.matches[i].homeTeam.name}</h3>
            </div>
          </div>
        </div>

        <div class="text-center button-row">
          <input type="hidden" value="${i}">
          <button class="btn btn-primary subBtn"> Start Match</button>
        </div>

      </div>`;
    };
  },

  loadMatch: async function() {

    console.log('hi');

    let firstTeam = [];
    let secondTeam = [];

    for (let i=0; i<=App.matchCount; i++) {
      let n1 = await App.getTeamsGen(App.matches[i], "0");
      let n2 = await App.getTeamsGen(App.matches[i], "1")
      firstTeam.push(n1);
      secondTeam.push(n2);
    }

    const matchesContainer = document.getElementById('matches');

    for (let i=0; i<=App.matchCount; i++) {
      matchesContainer.innerHTML += 
      `<div class="match-card" id=${i}>
        <div class=row>
          <!-- Team 1 -->
          <div class="col-md-6">
            <div class="text-center">
              <h3 style="font-weight: 500" id="${name1}">${firstTeam[i]}</h3>
            </div>
          </div>
          <!-- Team 2 -->
          <div class="col-md-6">
            <div class="text-center">
              <h3 style="font-weight: 500" id="${name2}">${secondTeam[i]}</h3>
            </div>
          </div>
        </div>

        <div class="text-center button-row">
          <input type="hidden" value="${i}">
          <button class="btn btn-primary subBtn"> Start Match</button>
        </div>

      </div>`;
    }

  },

  getMatches: async function() {
    const options = {
    method: 'GET',
    url: 'https://dev132-cricket-live-scores-v1.p.rapidapi.com/matches.php',
    params: {completedlimit: '0', inprogresslimit: '0', upcomingLimit: '5'},
    headers: {
      'x-rapidapi-key': 'cb3a7f6dd9mshc9ff18976534041p1d3cc5jsn5a25a513af0f',
      'x-rapidapi-host': 'dev132-cricket-live-scores-v1.p.rapidapi.com'
    }
    };
    return await axios.request(options);
  },

}


$(window).on('load', function() {
  App.init();
});