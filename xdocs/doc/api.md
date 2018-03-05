# PAT Token Sale Smart Contract: API

This document describes public API of PAT Token Sale Smart Contract.

## 1. Constructors

### 1.1. PATTokenSale(uint256,Token,address,uint256,uint256,int256,int256,int256)

#### Signature

    function PATTokenSale (
      uint256 _saleStartTime,
      uint256 _saleDuration,
      Token _token,
      address _centralBank,
      uint256 _saleCap,
      uint256 _minimumInvestment,
      int256 _a,
      int256 _b,
      int256 _c)

#### Description

Create new PAT Token Sale smart contract with given sale start time `_saleStartTime` and given sale duration `_saleDuration`.  The contract will sell tokens managed by ERC20 token smart contract at address `_token` transferring said tokens from address `_centralBank`.  Collected revenue will finally be sent to address `_centralBank`.  Sale cap is set to `_saleCap` Wei, minimum investment amount is set to `_minimumInvestment` Wei, parameters A, B, and C of price formula are set to `_a / 2^128`, `_b / 2^128`, and `_c / 2^128` respectively.

#### Use Cases

* Administration:Deploy

## 2. Methods

### 2.1. ()

#### Signature

    function () payable

#### Description

When called with no data is equivalent to `buy()`, otherwise just reverts.

#### Use Cases

* Investment:Buy

### 2.2. buy()

#### Signature

    function buy () payable

#### Description

Buy PAT tokens for ether sent along with method call.

#### Use Cases

* Investment:Buy

### 2.3. buyReferral(address) payable

#### Signature

    function buyReferral (address _referralCode) payable

#### Description

But PAT tokens for ether sent along with method call and refer to other investor.

#### Use Cases

* Investment:BuyReferral

### 2.4. outstandingTokens(address)

#### Signature

    function outstandingTokens (address _investor) constant returns (uint256)

#### Description

Return number of tokens to be delivered to investor with address `_investor`.

#### Use Cases

* Deliver:OutstandingTokens

### 2.5. deliver(address)

#### Signature

    function deliver (address _investor) returns (bool)

#### Description

Deliver tokens to investor with address `_investor`.
Returns true if tokens were delivered successfully, false otherwise.

#### Use Cases

* Deliver:Deliver

### 2.6. collectRevenue()

#### Signature

    function collectRevenue ()

#### Description

Send revenue to central bank and destroy smart contract in case tokens were delivered to all investors.
May only be called by central bank.

#### Use Cases

* Deliver:CollectRevenue

### 2.7. price(uint256)

#### Signature

    function price (uint256 _time) constant returns (uint256)

#### Description

Return price at time `_time` in Wei per PAT token multiplied by `2^128`.

#### Use Cases

* Investment:Price

### 2.8. finishSale()

#### Signature

    function finishSale ()

#### Description

Finish sale that didn't collect enough ether during sale period.
May only be called by central bank.

#### Use Cases

* Investment:FinishSale

### 2.9. destroy()

##### Signature

    function destroy ()

Destroy smart contract.  May only be called by central bank.

##### Use Cases

* Administration:Destroy

## 3. Events

### 3.1. Investment(address,uint256)

#### Signature

    event Investment (address indexed investor, uint256 amount)

#### Description

Logged when investment of amount `_amount` was made by investor with address `_investor`.

#### Use Cases

* Investment:Buy
* Investment:BuyReferral

### 3.2. Finished(uint256)

#### Signature

    event Finished (uint256 finalPrice)

#### Description

Logged when sale was successfully closed at final price `_finalPrice` measured in Wei per PAT token multipled by 2^128.

#### Use Cases

* Investment:Buy
* Investment:BuyReferral
