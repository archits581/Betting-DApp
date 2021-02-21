const getMatches = async()=>{
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
}


$(document).ready(async function(){

	var matches = await getMatches();
	const matchesContainer = document.getElementById('matches');
	for(var i = 0; i<matches.data.matchList.matches.length; i++){
		console.log(matches.data.matchList.matches[i]);
		if(matches.data.matchList.matches[i].awayTeam.name == "Unknown" || matches.data.matchList.matches[i].homeTeam.name == "Unknown"){
			continue;
		}
		matchesContainer.innerHTML += 
		`<div class="match-card" id=${i}>
			<div class=row>
				<!-- Team 1 -->
				<div class="col-md-6">
					<div class="text-center">
						<h3 style="font-weight: 500">${matches.data.matchList.matches[i].awayTeam.name}</h3>
					</div>
				</div>
				<!-- Team 2 -->
				<div class="col-md-6">
					<div class="text-center">
						<h3 style="font-weight: 500">${matches.data.matchList.matches[i].homeTeam.name}</h3>
					</div>
				</div>
			</div>

			<div class="text-center button-row">
				<button class="btn btn-primary"> Start Match</button>
			</div>

		</div>`;
	}

})