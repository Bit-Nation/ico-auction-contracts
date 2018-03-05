/*
 * Wrapper for PAT Token Sale Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.16;

import "./../../src/sol/PATTokenSale.sol";

/**
 * Wrapper for PAT Token Sale smart contract..
 */
contract PATTokenSaleWrapper is PATTokenSale {
  /**
   * Create PAT Token Sale Wrapper smart contract with given sale start time,
   * invitation signer address, token contract and central bank address.
   *
   * @param _saleStartTime sale start time
   * @param _saleDuration sale duration
   * @param _token ERC20 smart contract managing tokens to be sold
   * @param _centralBank central bank address to transfer tokens from
   * @param _saleCap maximum amount of ether to collect (in Wei)
   * @param _minimumInvestment minimum investment amount (in Wei)
   * @param _a parameter a of price formula
   * @param _b parameter b of price formula
   * @param _c parameter c of price formula
   */
  function PATTokenSaleWrapper (
    uint256 _saleStartTime, uint256 _saleDuration,
    Token _token, address _centralBank,
    uint256 _saleCap, uint256 _minimumInvestment,
    int256 _a, int256  _b, int256 _c)
    PATTokenSale (_saleStartTime, _saleDuration, _token, _centralBank,
      _saleCap, _minimumInvestment, _a, _b, _c) {
    // Do nothing
  }

  /**
   * Get number of tokens to be delivered to given investor.
   *
   * @param _investor address of the investor to get number of tokens to be
   *        delivered to
   * @return number of tokens to be delivered to given investor
   */
  function doOutstandingTokens (address _investor)
    constant public returns (bool, uint256) {
    return (true, outstandingTokens (_investor));
  }

  /**
   * Deliver purchased tokens to given investor.
   *
   * @param _investor investor to deliver purchased tokens to
   */
  function deliver (address _investor) public returns (bool success) {
    Result (success = PATTokenSale.deliver (_investor));
  }

  /**
   * Return token price at given time in Wei per token natural unit.
   *
   * @param _time time to return price at
   * @return price at given time as 128.128 fixed point number
   */
  function doPrice (uint256 _time) constant public returns (bool, uint256) {
    return (true, price (_time));
  }

  /**
   * Set sale start time.
   *
   * @param _saleStartTime new sale start time
   */
  function setSaleStartTime (uint256 _saleStartTime) {
    saleStartTime = _saleStartTime;
  }

  /**
   * Roll back finishSale operation.
   */
  function unfinishSale () {
    finished = false;
    finalPrice = 0;
  }

  /**
   * Deposit ether to contract's address.
   */
  function deposit () payable {
    // Do nothing
  }

  /**
   * Deposit ether to contract's address.
   */
  function withdraw () {
    msg.sender.transfer (this.balance);
  }

  /**
   * Set total invested value.
   *
   * @param _totalInvested total invested value to set
   */
  function setTotalInvested (uint256 _totalInvested) {
    totalInvested = _totalInvested;
  }

  /**
   * Used to log result of operation.
   *
   * @param _value result of operation
   */
  event Result (bool _value);
}
