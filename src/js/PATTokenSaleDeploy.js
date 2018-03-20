/*
 * Deployment script for PAT Token Sale Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

var startPrice = 1.0 / (22.0 * rate);
var endPrice = 1.0 / (112.0 * rate);

var C = 0.125;
var D = saleDuration * 24.0 * 3600.0;

var a = web3.toBigNumber (
  (endPrice - startPrice) *
    Math.log (1.0 / (C * D)) /
      Math.log (1.0 + 1.0 / C) +
    startPrice).
      mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
        round ();
var b = web3.toBigNumber (
  (endPrice - startPrice) /
    Math.log (1.0 + 1.0 / C)).
      mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
        round ();
var c = web3.toBigNumber (C * D - saleStartTime).
  mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
    round ();

var saleCap = web3.toBigNumber (27300000.0 * 1.0e18 / rate).round ();
var minimumInvestment = web3.toBigNumber (0.05e18).round ();

if (!web3.eth.contract (@ABI@).new (
  saleStartTime,
  saleDuration * 86400,
  token,
  centralBank,
  saleCap,
  minimumInvestment,
  a, b, c,
  {from: web3.eth.accounts[0], data: "0x@BIN@", gas: 3000000},
  function (e, r) {
    if (e) throw e;
    if (typeof r.address !== "undefined") {
      console.log (
        "Deployed at " + r.address + " (tx: " + r.transactionHash + ")");
    }
  }).transactionHash) {
  console.log ("Deployment failed.  Probably web3.eth.accounts[0] is locked.");
}

