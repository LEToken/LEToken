

function decodeStats(response, price) {
    if (response == null) return null;

    var result = response.result;
    if (result == null || result.length == null || result.length < 193) return null;

    var weiPerEther = new BigNumber("1000000000000000000", 10);

    var totalContributionExact = new BigNumber(result.substr(2, 64), 16).div(weiPerEther);
    var totalContributionUSDExact = totalContributionExact.times(new BigNumber(price));
	var n5000 = new BigNumber(result.substr(322,64),16).round(0,BigNumber.ROUND_DOWN); 
	var	n1500 = new BigNumber(result.substr(386,64),16).round(0,BigNumber.ROUND_DOWN);
	var	n500 = new BigNumber(result.substr(450,64),16).round(0,BigNumber.ROUND_DOWN);
	var	n10 = new BigNumber(result.substr(514,64),16).round(0,BigNumber.ROUND_DOWN);

    return {
        totalContribution: totalContributionExact.round(3, BigNumber.ROUND_DOWN),
        totalContributionUSD: totalContributionUSDExact.round(0, BigNumber.ROUND_DOWN),
        totalSupply: new BigNumber(result.substr(66, 64), 16).div(weiPerEther).round(3, BigNumber.ROUND_DOWN),
        totalBonusTokensIssued: new BigNumber(result.substr(130, 64), 16).div(weiPerEther).round(3, BigNumber.ROUND_DOWN),
        nTransaction: new BigNumber(result.substr(194,64),16).round(0,BigNumber.ROUND_DOWN),
		nTransactionWin: new BigNumber(result.substr(258,64),16).round(0,BigNumber.ROUND_DOWN),
		n5000,
		n1500,
		n500,
		n10,
		n5000USD: n5000.times(new BigNumber(price)).times(4),
		n1500USD: n1500.times(new BigNumber(price)),
		n500USD: n500.times(new BigNumber(price)).times(0.5),
		n10USD: n10.times(new BigNumber(price)).times(0.02)
	}
	
	
}

function getStats(price) {
    
	var url = "https://api.etherscan.io/api?module=proxy&action=eth_call&to=0xc98392308F391AB8B67087E7A2101cde21773e9D&data=0xc59d48470000000000000000000000000000000000000000000000000000000000000000&tag=latest"; 
	    return $.ajax(url, {
        cache: false,                                                                 
        dataType: "json"
    }).then(function (data) { return decodeStats(data, price); });
}

function getPrice() {
    var url = "https://api.etherscan.io/api?module=stats&action=ethprice";
    return $.ajax(url, {
        cache: false,
        dataType: "json"
    }).then(function (data) {
        if (data == null) return null;
        if (data.result == null) return null;
        if (data.result.ethusd == null) return null;

        return parseFloat(data.result.ethusd);
    });
}

function updatePage(stats) {
    if (stats == null) return;


    $("#total-ether").text(stats.totalContribution.toFixed(3));
    $("#total-usd").text("$" + stats.totalContributionUSD.toFixed(0));
    $("#total-tokens").text(stats.totalSupply.toFixed(0));
    $("#total-bonus").text(stats.totalBonusTokensIssued.toFixed(0));
    $("#total-trans").text(stats.nTransaction.toFixed(0));
    $("#total-transW").text(stats.nTransactionWin.toFixed(0));
	$("#total-n5000").text(stats.n5000.toFixed(0));
	$("#total-n1500").text(stats.n1500.toFixed(0));
	$("#total-n500").text(stats.n500.toFixed(0));
	$("#total-n10").text(stats.n10.toFixed(0));
	$("#total-n5000USD").text(stats.n5000USD.toFixed(0) + "$");
	$("#total-n1500USD").text(stats.n1500USD.toFixed(0) + "$");
	$("#total-n500USD").text(stats.n500USD.toFixed(0) + "$");
	$("#total-n10USD").text(stats.n10USD.toFixed(0) + "$");	
	
    $("#stats").show();
}

function refresh() { getPrice().then(getStats).then(updatePage); }

$(function() {
    try {
        refresh();
        setInterval(refresh, 1000 * 60 * 5);
    } catch (err) { }
});
