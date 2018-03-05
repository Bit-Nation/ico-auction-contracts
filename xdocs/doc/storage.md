# PAT Token Sale Smart Contract: Storage

This file describes storage structure of PAT Token Sale smart contract.

# 1. saleStartTime

## Signature

    uint256 internal saleStartTime

## Description

Sale start time in seconds since epoch.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:Price
* Investment:FinishSale
* Administration:Destroy

## Modified in Use Cases

* Administration:Deploy

# 2. saleDuration

## Signature

    uint256 internal saleDuration

## Description

Sale duration in seconds.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:Price
* Investment:FinishSale
* Administration:Destroy

## Modified in Use Cases

* Administration:Deploy

# 3. token

## Signature

    Token internal token

## Description

ERC20 token smart contract managing PAT tokens.

## Used in Use Cases

* Deliver:Deliver

## Modified in Use Cases

* Administration:Deploy

# 4. centralBank

## Signature

    address internal centralBank

## Description

Address of central bank.

## Used in Use Cases

* Deliver:Deliver
* Deliver:CollectRevenue
* Investment:FinishSale
* Administration:Destroy

## Modified in Use Cases

* Administration:Deploy

# 5. saleCap

## Signature

    uint256 internal saleCap

## Description

Sale cap in Wei.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral

## Modified in Use Cases

* Administration:Deploy

# 6. minimumInvestment

## Signature

    uint256 internal minimumInvestment

## Description

Minimum investment amount in Wei.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral

## Modified in Use Cases

* Administration:Deploy

# 7. a

## Signature

    iint256 internal a

## Description

Parameter A of price formula multiplied by 2^128.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:Price
* Investment:FinishSale

## Modified in Use Cases

* Administration:Deploy

# 8. b

## Signature

    iint256 internal b

## Description

Parameter B of price formula multiplied by 2^128.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:Price
* Investment:FinishSale

## Modified in Use Cases

* Administration:Deploy

# 9. c

## Signature

    iint256 internal c

## Description

Parameter C of price formula multiplied by 2^128.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:Price
* Investment:FinishSale

## Modified in Use Cases

* Administration:Deploy

# 10. finished

## Signature

    bool internal finished

## Description

True if sale is already closed successfully, false otherwise.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Deliver:Deliver
* Investment:FinishSale
* Administration:Destroy

## Modified in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:FinishSale

# 11. finalPrice

## Signature

    uint256 internal finalPrice

## Description

Final price in Wei per PAT token in case sale is already closed successfully, zero otherwise.

## Used in Use Cases

* Deliver:Deliver
* Deliver:OutstandingTokens

## Modified in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Investment:FinishSale

# 12. investors

## Signature

    mapping (address => Investor) internal investors

    struct Investor {
      uint256 amount;
      uint256 bonusAmount;
      bool investedByReferrers;
    }

## Description

Maps address of an investor to information about investments made by him.
Value of `investors[investor].amount` is total amount of ether invested by this investor if tokens were not yet delivered to him, otherwise value is zero.
Value of `investors[investor].bonusAmount` is amount of ether this investors should receive 2.5% bonus for because of early investment or because he referred other investors if tokens were not yet delivered to him, otherwise value is zero.  In other words, this is amount of ether invested during first hour multiplied by 6 plus amount of ether invested during first day but not first hour multiplied by 4 plus amount invested during first week but not first day multiplied by 2 plus amount eligible for referrer bonus.
Value of `investors[investor].investedByReferrers` is total amount of ether invested by others while referring this investor.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Deliver:Deliver
* Deliver:OutstandingTokens

## Modified in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Deliver:Deliver

# 13. totalInvested

## Signature

    uinbt256 internal totalInvested

## Description

Total amount of ether invested by investors who tokens were not yet delivered to.

## Used in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Deliver:Deliver
* Administration:Destroy

## Modified in Use Cases

* Investment:Buy
* Investment:BuyReferral
* Deliver:Deliver
