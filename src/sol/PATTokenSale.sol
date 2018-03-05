/*
 * PAT Token Sale Smart Contract.  Copyright � 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.16;

import "./Token.sol";
import "./Math.sol";

/**
 * Continuous Sale Action for selling PAT tokens.
 */
contract PATTokenSale is Math {
  /**
   * Time period when 15% bonus is in force.
   */
  uint256 private constant TRIPLE_BONUS = 1 hours;

  /**
   * Time period when 10% bonus is in force.
   */
  uint256 private constant DOUBLE_BONUS = 1 days;

  /**
   * Time period when 5% bonus is in force.
   */
  uint256 private constant SINGLE_BONUS = 1 weeks;

  /**
   * Create PAT Token Sale smart contract with given sale start time, token
   * contract and central bank address.
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
  function PATTokenSale (
    uint256 _saleStartTime, uint256 _saleDuration,
    Token _token, address _centralBank,
    uint256 _saleCap, uint256 _minimumInvestment,
    int256 _a, int256 _b, int256 _c) {
    saleStartTime = _saleStartTime;
    saleDuration = _saleDuration;
    token = _token;
    centralBank = _centralBank;
    saleCap = _saleCap;
    minimumInvestment = _minimumInvestment;
    a = _a;
    b = _b;
    c = _c;
  }

  /**
   * Equivalent to buy().
   */
  function () payable public {
    require (msg.data.length == 0);

    buy ();
  }

  /**
   * Buy tokens.
   */
  function buy () payable public {
    require (!finished);
    require (now >= saleStartTime);
    require (now < safeAdd (saleStartTime, saleDuration));

    require (msg.value >= minimumInvestment);

    if (msg.value > 0) {
      uint256 remainingCap = safeSub (saleCap, totalInvested);
      uint256 toInvest;
      uint256 toRefund;

      if (msg.value <= remainingCap) {
        toInvest = msg.value;
        toRefund = 0;
      } else {
        toInvest = remainingCap;
        toRefund = safeSub (msg.value, toInvest);
      }

      Investor storage investor = investors [msg.sender];
      investor.amount = safeAdd (investor.amount, toInvest);
      if (now < safeAdd (saleStartTime, TRIPLE_BONUS))
        investor.bonusAmount = safeAdd (
          investor.bonusAmount, safeMul (toInvest, 6));
      else if (now < safeAdd (saleStartTime, DOUBLE_BONUS))
        investor.bonusAmount = safeAdd (
          investor.bonusAmount, safeMul (toInvest, 4));
      else if (now < safeAdd (saleStartTime, SINGLE_BONUS))
        investor.bonusAmount = safeAdd (
          investor.bonusAmount, safeMul (toInvest, 2));

      Investment (msg.sender, toInvest);

      totalInvested = safeAdd (totalInvested, toInvest);
      if (toInvest == remainingCap) {
        finished = true;
        finalPrice = price (now);

        Finished (finalPrice);
      }

      if (toRefund > 0)
        msg.sender.transfer (toRefund);
    }
  }

  /**
   * Buy tokens providing referral code.
   *
   * @param _referralCode referral code, actually address of referee
   */
  function buyReferral (address _referralCode) payable public {
    require (msg.sender != _referralCode);

    Investor storage referee = investors [_referralCode];

    // Make sure referee actually did invest something
    require (referee.amount > 0);

    Investor storage referrer = investors [msg.sender];
    uint256 oldAmount = referrer.amount;

    buy ();

    uint256 invested = safeSub (referrer.amount, oldAmount);

    // Make sure referrer actually did invest something
    require (invested > 0);

    referee.investedByReferrers = safeAdd (
      referee.investedByReferrers, invested);

    referrer.bonusAmount = safeAdd (
      referrer.bonusAmount,
      min (referee.amount, invested));
  }

  /**
   * Get number of tokens to be delivered to given investor.
   *
   * @param _investor address of the investor to get number of tokens to be
   *        delivered to
   * @return number of tokens to be delivered to given investor
   */
  function outstandingTokens (address _investor)
    constant public returns (uint256) {
    require (finished);
    assert (finalPrice > 0);

    Investor storage investor = investors [_investor];
    uint256 bonusAmount = investor.bonusAmount;
    bonusAmount = safeAdd (
      bonusAmount, min (investor.amount, investor.investedByReferrers));

    uint256 effectiveAmount = safeAdd (
      investor.amount,
      bonusAmount / 40);

    return fpDiv (effectiveAmount, finalPrice);
  }

  /**
   * Deliver purchased tokens to given investor.
   *
   * @param _investor investor to deliver purchased tokens to
   */
  function deliver (address _investor) public returns (bool) {
    require (finished);

    Investor storage investor = investors [_investor];
    require (investor.amount > 0);

    uint256 value = outstandingTokens (_investor);
    if (value > 0) {
      if (!token.transferFrom (centralBank, _investor, value)) return false;
    }

    totalInvested = safeSub (totalInvested, investor.amount);
    investor.amount = 0;
    investor.bonusAmount = 0;
    investor.investedByReferrers = 0;
    return true;
  }

  /**
   * Collect sale revenue.
   */
  function collectRevenue () public {
    require (msg.sender == centralBank);

    centralBank.transfer (this.balance);
  }

  /**
   * Return token price at given time in Wei per token natural unit.
   *
   * @param _time time to return price at
   * @return price at given time as 128.128 fixed point number
   */
  function price (uint256 _time) constant public returns (uint256) {
    require (_time >= saleStartTime);
    require (_time <= safeAdd (saleStartTime, saleDuration));

    require (_time <= TWO128_1);
    uint256 t = _time << 128;

    uint256 cPlusT = (c >= 0) ?
      safeAdd (t, uint256 (c)) :
        safeSub (t, uint256 (-1 - c) + 1);
    int256 lnCPlusT = ln (cPlusT);
    int256 bLnCPlusT = fpMulI (b, lnCPlusT);
    int256 aPlusBLnCPlusT = safeAddI (a, bLnCPlusT);

    require (aPlusBLnCPlusT >= 0);
    return uint256 (aPlusBLnCPlusT);
  }

  /**
   * Finish sale after sale period ended.
   */
  function finishSale () public {
    require (msg.sender == centralBank);
    require (!finished);
    uint256 saleEndTime = safeAdd (saleStartTime, saleDuration);
    require (now >= saleEndTime);

    finished = true;
    finalPrice = price (saleEndTime);

    Finished (finalPrice);
  }

  /**
   * Destroy smart contract.
   */
  function destroy () public {
    require (msg.sender == centralBank);
    require (finished);
    require (now >= safeAdd (saleStartTime, saleDuration));
    require (totalInvested == 0);
    require (this.balance == 0);

    selfdestruct (centralBank);
  }

  /**
   * Return minimum of two values.
   *
   * @param x first value
   * @param y second value
   * @return minimum of two values
   */
  function min (uint256 x, uint256 y) pure returns (uint256) {
    return x < y ? x : y;
  }

  /**
   * Sale start time.
   */
  uint256 internal saleStartTime;

  /**
   * Sale duration.
   */
  uint256 internal saleDuration;

  /**
   * ERC20 token smart contract managing tokens to be sold.
   */
  Token internal token;

  /**
   * Address of central bank to transfer tokens from.
   */
  address internal centralBank;

  /**
   * Maximum number of Wei to collect.
   */
  uint256 internal saleCap;

  /**
   * Minimum investment amount in Wei.
   */
  uint256 internal minimumInvestment;

  /**
   * Price formula parameters.  Price at given time t is calculated as
   * a / 2^128 + b * ln ((c + t) / 2^128) / 2^128.
   */
  int256 internal a;
  int256 internal b;
  int256 internal c;

  /**
   * True is sale was finished successfully, false otherwise.
   */
  bool internal finished = false;

  /**
   * Final price for finished sale.
   */
  uint256 internal finalPrice;

  /**
   * Maps investor's address to corresponding Investor structure.
   */
  mapping (address => Investor) internal investors;

  /**
   * Total amount invested in Wei.
   */
  uint256 internal totalInvested = 0;

  /**
   * Encapsulates information about investor.
   */
  struct Investor {
    /**
     * Total amount invested in Wei.
     */
    uint256 amount;

    /**
     * Bonus amount in Wei multiplied by 40.
     */
    uint256 bonusAmount;

    /**
     * Total amount of ether invested by others while referring this address.
     */
    uint256 investedByReferrers;
  }

  /**
   * Logged when an investment was made.
   *
   * @param investor address of the investor who made the investment
   * @param amount investment amount
   */
  event Investment (address indexed investor, uint256 amount);

  /**
   * Logged when sale finished successfully.
   *
   * @param finalPrice final price of the sale in Wei per token natural unit as
   *                   128.128 bit fixed point number.
   */
  event Finished (uint256 finalPrice);
}
