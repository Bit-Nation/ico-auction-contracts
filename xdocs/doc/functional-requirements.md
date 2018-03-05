# PAT Token Sale Smart Contract: Functional Requirements

This document summarizes functional requirements for PAT Token Sale Smart
Contract.

## 1. Introduction

PAT Token Sale Smart Contract is an [Ethereum](https://ethereum.org/) smart contract that implements reverse Dutch auction for selling [PAT Tokens](https://github.com/Bit-Nation/Pangea-Arbitration-Token-and-ICO-Material).
During the sale period, token price is decreasing until either sale period ends or certain amount of ether is collected.
Number of tokens distributed to each investor is calculated based on how much ether this investor invested, what was the price at the moment when sale period ended or certain amount of ether was collected, and whether this investor is eligible to receive bonus.

## 2. Price Formula and Bonus Structure

This section defines price-calculation formula and structure of bonuses applied when smart contract calculates how many tokens to send to each particular investor.

Basic price formula is `P(t) = A + B ln (C + t)`.
Here `t` is time in seconds since epoch and `A`, `B`, and `C` and parameters (see below).
Value of `P(t)` is price of one PAT token in Wei at time `t`.
Parameters `A`, `B`, and `C` and chosen in such way that the following conditions are met:

* `P(Tstart) = Pstart` (price at the start of the sale equals to start price)
* `P(Tend) = Pend` (price at the end of the sale equals to end price)
* `P(0.75 Tstart + 0.25 Tend) = 0.5 Pstart + 0.5 Pend` (price at the end of the first quarter of sale period is mean value of start and end price)

Here `Tend = Tstart + saleDuration`.
Start price is 22 PAT per $1 and end price is 112 PAT per $1, so `Pstart = 10^18 / (22 rate)`, `Pend = 10^18 / (112 rate)`.
Here `rate` is price of 1 ether in US dollars.

Number of tokens to be distributed to investor is calculated via the following formula: `(Itotal + 0.15 Ihour + 0.1 Iday + 0.05 Iweek + 0.025 Ireferer + 0.025 min (Itotal, Ireferee)) / P (Tfinish)`.
Here `Itotal` is total amount of invested funds (in Wei), `Ihour` is an amount invested during first hour of sale, `Iday` is amount invested during first day (24 hours) but not during the first hour, `Iweek` is amount invested during first week but not during first day.
`Ireferrer` equals to sum of `min(Iinvested_i, Ireferee_i)` for all investments made by this investor, here `Iinvested_i` is the amount of i-th investment and `Ireferee_i` is amount invested by those who was referred by i-th investment up to the moment of i-in investment.
`Ireferee` equals to total amount of ether invested by others while referring this investor.

## 3. Use Cases

This section describes use cases of PAT Token Sale Smart Contract.
The use cases are grouped into functional blocks.

### 3.1. Investment Use Cases

This section describes use cases related to investing ether.

#### 3.1.1. Investment:Buy

**Actors:** _Investor_, _Smart Contract_

**Goal:** _Investor_ wants to invest some ether

##### Main Flow:

1. _Investor_ calls method on _Smart Contract_ or performs no-data transaction to it; along with call _Investor_ sends certain amount of ether
2. Sale is not yet closed
3. Sale period is already started
4. Sale period is not yet ended
5. Amount of ether sent along with the call is not less than minimum investment amount
6. Amount of ether sent along with the call is greater than zero
7. Amount of already collected ether plus amount of ether sent along with the call is less than sale cap
8. _Smart Contract_ accepts ether sent along with the call and remembers the investment
9. _Smart Contract_ logs investment event with the following information: address of _Investor_ and invested amount

##### Exceptional Flow #1:

1. Same as in Main Flow
2. Sale is already closed
3. _Smart Contract_ cancels transaction

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Sale period is not started yet
4. _Smart Contract_ cancels transaction

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Sale period is already ended
5. _Smart Contract_ cancels transaction

##### Exceptional Flow #4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Sale as in Main Flow
5. Amount of ether sent along with the call is less than minimum investment amount
6. _Smart Contract_ cancels transaction

##### Exceptional Flow #5:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Amount of ether sent along with the call is zero
7. _Smart Contract_ does nothing

##### Exceptional Flow #6:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Amount of already collected ether plus amount of ether sent along with the call plus equals to sale cap
8. Same as in Main Flow
9. Same as in Main Flow
10. _Smart Contract_ logs finished event with the following information: current price calculated using price formula
11. _Smart Contract_ finishes sale

##### Exceptional Flow #7:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Amount of already collected ether plus amount of ether sent along with the call plus is greater than sale cap
8. _Smart Contract_ accepts ether that fits under sale cap and remembers the investment
9. Same as in Main Flow
10. _Smart Contract_ logs finished event with the following information: current price calculated using price formula
11. _Smart Contract_ finishes sale
12. _Smart Contract_ returns ether that exceeds sale cap
13. Ether is returned successfully

##### Exceptional Flow #8:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Same as in Main Flow
7. Amount of already collected ether plus amount of ether sent along with the call plus is greater than sale cap
8. _Smart Contract_ accepts ether that fits under sale cap and remembers the investment
9. Same as in Main Flow
10. _Smart Contract_ logs finished event with the following information: current price calculated using price formula
11. _Smart Contract_ finishes sale
12. _Smart Contract_ returns ether that exceeds sale cap
13. An attempts to return ether failed
14. _Smart Contract_ cancels transaction

#### 3.1.2. Investment:BuyReferral

**Actors:** _Investor_, _Smart Contract_

**Goal:** _Investor_ wants to invest some ether using referral code

##### Main Flow:

1. _Investor_ calls method on _Smart Contract_ providing the following information as method parameters: address of existing investor; along with call _Investor_ sends certain amount of ether
2. Address provided as method parameter is not the same as own address of _Investor_
3. Existing investor whose address is provided as method parameter already invested some ether
4. Use Case Investment:Buy is executed successfully
5. _Investor_ actually invested some ether

##### Exceptional Flow #1:

1. Same as in Main Flow
2. Address provided as method parameter is the same as own address of _Investor_
3. _Smart Contract_ cancels transaction

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Existing investor whose address is provided as method parameter didn't invested any ether so far
4. _Smart Contract_ cancels transaction

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Execution of use case Investment:Buy cancelled transaction

##### Exceptional Flow #4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. _Investor_ actually didn't invest any ether
6. _Smart Contract_ cancels transaction

#### 3.1.3. Investment:Price

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know price at certain time

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: time to get price at
2. Time provided is greater than or equal to sale start time
3. Time provided is less than sale end time
4. _Smart Contract_ returns price at given time to _User_

##### Exceptional Flow #1:

1. Same as in Main Flow
2. Time provided is less than sale start time
3. _Smart Contract_ cancels transaction

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Time provided is greater than or equal to sale end time
4. _Smart Contract_ cancels transaction

#### 3.1.4. Investment:FinishSale

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to finish sale that didn't collect enough ether during sale period

##### Main Flow:

1. _User_ calls method on _Smart Contract
2. _User_ is central bank
3. Sale is not finished yet
4. Sale period has ended
5. _Smart Contract_ finishes sale at price corresponding to the end of sale period (not current time)
6. _Smart Contract_ logs finished event with the following information: sale final price

##### Exceptional Flow #1:

1. Same as in Main Flow
2. _User_ is not central bank
3. _Smart Contract_ cancels transaction

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Sale is already finished
4. _Smart Contract_ cancels transaction

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Sale period didn't end yet
5. _Smart Contract_ cancels transaction

### 3.2. Deliver Use Cases

This section describes use cases related to tokens and revenue delivery.

#### 3.2.1. Deliver:OutstandingTokens

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants to know how many tokens are to be delivered to the owner of certain address

##### Main Flow:

1. _User_ calls constant method on _Smart Contract_ providing the following information as method parameters: address to get number of tokens to be delivered to the owner of
2. Sale already closed
3. _Smart Contract_ returns to _User_ number of tokens to be delivered to the owner of given address

##### Exceptional Flow #1:

1. Same as in Main Flow
2. Sale is not yet closed
3. _Smart Contract_ cancels transaction

#### 3.2.2. Deliver:Deliver

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants tokens to be delivered to the owner of certain address

##### Main Flow:

1. _User_ calls method on _Smart Contract_ providing the following information as method parameters: address to deliver tokens to the owner of
2. Sale already closed
3. Owner of given address did invest some ether and tokens were not yet delivered to him
4. Number of tokens to be delivered to the owner of given address is more than zero
5. _Smart Contract_ sends corresponding number of tokens from central bank address to the given address
6. Tokens transferred successfully
7. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow #1:

1. Same as in Main Flow
2. Sale is not yet closed
3. _Smart Contract_ cancels transaction

##### Exceptional flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Owner of given address didn't invest any ether or tokens were already delivered to him
4. _Smart Contract_ cancels transaction

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Number of tokens to be delivered to the owner of given address is zero
5. _Smart Contract_ assumes that tokens are now delivered to the owner of given address
6. _Smart Contract_ returns success indicator to _User_

##### Exceptional Flow #4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Token transfer failed
7. _Smart Contract_ returns error indicator to _User_

#### 3.2.3. Deliver:CollectRevenue

**Actors:** _User_, _Smart Contract_

**Goal:** _User_ wants sale revenue to be transferred to central bank

##### Main Flow:

1. _User_ calls method on _Smart Contract_
2. _User_ is central bank
3. _Smart Contract_ sends all ether from balance of _Smart Contract_ to central bank
4. Ether transfer succeeded

##### Exceptional Flow #1:

1. Same as in Main Flow
2. _User_ is not central bank
3. _Smart Contract_ cancels transaction

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Ether transfer failed
5. _Smart Contract_ cancels transaction

### 3.3. Administration Use Cases

This section describes use cases related to smart contract administration.

#### 3.3.1. Administration:Deploy

**Actors:** _Administrator_, _Smart Contract_

**Goal:** _Administrator_ wants to deploy _Smart Contract_

1. _Administrator_ deploys _Smart Contract_ providing the following information as constructor parameters: sale start time, sale duration, address of PAT token smart contract, address of central bank, sale cap, minimum investment amount, parameters A, B, and C of price formula
2. _Smart Contract_ remembers parameters passed to constructor

#### 3.3.2. Administration:Destroy

**Actors:** _Administrator_, _Smart Contract_

**Goal:** _Administrator_ wants to destroy _Smart Contract_.

##### Main Flow:

1. _Administrator_ calls method on smart contract
2. _Administrator_ is central bank
3. Sale is finished
4. Sale period has ended
5. All tokens have been delivered to investors
6. Balance of _Smart Contract_ is zero
7. _Smart Contract_ destroys itself

##### Exceptional Flow #1:

1. Same as in Main Flow
2. _Administrator is not central bank
3. _Smart Contract_ cancels transaction

##### Exceptional Flow #2:

1. Same as in Main Flow
2. Same as in Main Flow
3. Sale is not finished yet
4. _Smart Contract_ cancels transaction

##### Exceptional Flow #3:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Sale period didn't end yet
5. _Smart Contract_ cancels transaction

##### Exceptional Flow #4:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Not all tokens were delivered to investors
6. _Smart Contract_ cancels transaction

##### Exceptional Flow #5:

1. Same as in Main Flow
2. Same as in Main Flow
3. Same as in Main Flow
4. Same as in Main Flow
5. Same as in Main Flow
6. Balance of _Smart Contract_ is not zero
7. _Smart Contract_ cancels transaction
