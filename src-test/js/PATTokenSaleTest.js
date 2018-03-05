/*
 * Test for PAT Token Sale Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "PATTokenSale",
  steps: [
    { name: "Ensure there is at least out account: Alice",
      body: function (test) {
        while (!web3.eth.accounts || web3.eth.accounts.length < 1)
          personal.newAccount ("");

        test.alice = web3.eth.accounts [0];
      }},
    { name: "Ensure Alice has at least 5 ETH",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getBalance (test.alice).gte (web3.toWei ("5", "ether"));
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice deploys five Wallet contracts: Bob, Carol, Dave, Elly, and Frank",
      body: function (test) {
        test.walletContract =
          loadContract ("Wallet");
        var walletCode =
          loadContractCode ("Wallet");

        personal.unlockAccount (test.alice, "");
        test.tx1 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
        test.tx2 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
        test.tx3 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
        test.tx4 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
        test.tx5 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contracts were deployed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx1) &&
          web3.eth.getTransactionReceipt (test.tx2) &&
          web3.eth.getTransactionReceipt (test.tx3) &&
          web3.eth.getTransactionReceipt (test.tx4) &&
          web3.eth.getTransactionReceipt (test.tx5);
      },
      body: function (test) {
        miner.stop ();

        test.bob = getDeployedContract (
          "Bob",
          test.walletContract,
          test.tx1);

        test.carol = getDeployedContract (
          "Carol",
          test.walletContract,
          test.tx2);

        test.dave = getDeployedContract (
          "Dave",
          test.walletContract,
          test.tx3);

        test.elly = getDeployedContract (
          "Elly",
          test.walletContract,
          test.tx4);

        test.frank = getDeployedContract (
          "Frank",
          test.walletContract,
          test.tx5);
      }},
    { name: "Alice deploys SimpleToken smart contract",
      body: function (test) {
        test.simpleTokenContract =
          loadContract ("SimpleToken");
        var simpleTokenContractCode =
          loadContractCode ("SimpleToken");

        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleTokenContract.new (
          {from: test.alice, data: simpleTokenContractCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.simpleToken = getDeployedContract (
          "SimpleToken",
          test.simpleTokenContract,
          test.tx);
      }},
    { name: "Alice deploys PATTokenSaleWrapper contract",
      body: function (test) {
        test.patTokenSaleWrapperContract =
          loadContract ("PATTokenSaleWrapper");
        var patTokenSaleWrapperCode =
          loadContractCode ("PATTokenSaleWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapperContract.new (
          1000000000,
          31 * 86400,
          test.simpleToken.address,
          test.bob.address,
          1000000,
          3,
          web3.toBigNumber ("0x500000000000000000000000000000000"),
          web3.toBigNumber ("0x700000000000000000000000000000000"),
          web3.toBigNumber ("0x800000000000000000000000000000000"),
          {from: test.alice, data: patTokenSaleWrapperCode, gas:3000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.patTokenSaleWrapper = getDeployedContract (
          "PATTokenSaleWrapper",
          test.patTokenSaleWrapperContract,
          test.tx);

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [0]);

        assertEquals (
          "test.patTokenSaleWrapper.doPrice (999999999) [0]",
          false,
          test.patTokenSaleWrapper.doPrice (999999999) [0]);

        assertEquals (
          "test.patTokenSaleWrapper.doPrice (1000000000) [0]",
          true,
          test.patTokenSaleWrapper.doPrice (1000000000) [0]);

        assertBNEquals (
          "test.patTokenSaleWrapper.doPrice (1000000000) [1]",
          "51063745498956137997402501617658786136448",
          test.patTokenSaleWrapper.doPrice (1000000000) [1]);

        assertEquals (
          "test.patTokenSaleWrapper.doPrice (1002678399) [0]",
          true,
          test.patTokenSaleWrapper.doPrice (1002678399) [0]);

        assertBNEquals (
          "test.patTokenSaleWrapper.doPrice (1002678399) [1]",
          "51070116853852647268219076940143765466752",
          test.patTokenSaleWrapper.doPrice (1002678399) [1]);

        assertEquals (
          "test.patTokenSaleWrapper.doPrice (1002678400) [0]",
          true,
          test.patTokenSaleWrapper.doPrice (1002678400) [0]);

        assertBNEquals (
          "test.patTokenSaleWrapper.doPrice (1002678400) [1]",
          "51070116856228260975096044114128771460576",
          test.patTokenSaleWrapper.doPrice (1002678400) [1]);

        assertEquals (
          "test.patTokenSaleWrapper.doPrice (1002678401) [0]",
          false,
          test.patTokenSaleWrapper.doPrice (1002678401) [0]);
      }},
    { name: "Alice sets sale start time to now - 10 days",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          now - 10 * 24 * 3600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to finish sale, but sale period didn't end yet",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.finishSale.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx);
      }},
    { name: "Dave sends 100000 Wei to smart contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          "",
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.dave.address, amount: 100000 });
      }},
    { name: "Elly sends 200000 Wei to smart contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.patTokenSaleWrapper.address,
          "",
          200000,
          {from: test.alice, value: 200000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.elly.address, amount: 200000 });
      }},
    { name: "Alice sets sale start time to now + 1 hour",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          now + 3600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to finish sale, but sale didn't start yet",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.finishSale.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx);
      }},
    { name: "Carol tries to send 100000 Wei to smart contract but sale didn't start yet",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          "",
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Carol tries to buy tokens for 100000 Wei but sale didn't start yet",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Carol tries to buy with referral code tokens for 100000 Wei but sale didn't start yet",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.dave.address),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Alice sets sale start time to now - 31 days",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        test.saleStartTime = now - 31 * 24 * 3600;

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          test.saleStartTime,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to finish sale, but she is not central bank",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.finishSale.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx);
      }},
    { name: "Bob finishes sale",
      body: function (test) {
        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0])

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.finishSale.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
        precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        var price = test.patTokenSaleWrapper.price (
          test.saleStartTime + 31 * 24 * 3600);

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx,
          { finalPrice: price });

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [1]",
          web3.toBigNumber (100000).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (price),
          test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [1])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [1]",
          web3.toBigNumber (200000).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (price),
          test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [1])
      }},
    { name: "Alice unfinishes sale",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.unfinishSale (
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to send 100000 Wei to smart contract but sale already stopped",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          "",
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Carol tries to buy tokens for 100000 Wei but sale already stopped",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Carol tries to buy with referral code tokens for 100000 Wei but sale already stopped",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.dave.address),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Alice tells Elly to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice sets sale start time to now",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          now,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol sends 100000 Wei to smart contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          "",
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.carol.address, amount: 100000 });
      }},
    { name: "Carol buys tokens for 100000 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.carol.address, amount: 100000 });
      }},
    { name: "Carol tries to buy with referral code tokens for 100000 Wei but the code is her own",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.carol.address),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Carol tries to buy with referral code tokens for 100000 Wei but the code is invalid",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.patTokenSaleWrapper.address),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Carol buys with referral code tokens for 100000 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.dave.address),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.carol.address, amount: 100000 });
      }},
    { name: "Alice sets sale start time to now minus 1 hour",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          now - 3600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly buys with referral code tokens for 40000 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.carol.address),
          40000,
          {from: test.alice, value: 40000, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.elly.address, amount: 40000 });
      }},
    { name: "Alice sets sale start time to now minus 1 day",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          now - 24 * 3600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Elly buys with referral code tokens for 60000 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buyReferral.getData (test.carol.address),
          60000,
          {from: test.alice, value: 60000, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.elly.Result",
          test.elly,
          test.elly.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.elly.address, amount: 60000 });
      }},
    { name: "Alice sets sale start time to now minus 7 days",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          now - 7 * 24 * 3600,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 100000 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          100000,
          {from: test.alice, value: 100000, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.bob.address, amount: 100000 });
      }},
    { name: "Frank tries to buy tokens for 2 Wei but this is less than minimum invetment amount",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          2,
          {from: test.alice, value: 2, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx);
      }},
    { name: "Frank buys tokens for 3 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.frank.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          3,
          {from: test.alice, value: 1, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.frank.Result",
          test.frank,
          test.frank.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.frank.address, amount: 3 });
      }},
    { name: "Bob tries to buy tokens for 1000000 Wei but this will exceed sale cap and Bob does not accept payments",
      body: function (test) {
        assertBalance (
          "test.patTokenSaleWrapper",
          800003, "Wei",
          test.patTokenSaleWrapper.address);

        assertBalance (
          "test.bob",
          0, "Wei",
          test.bob.address);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          1000000,
          {from: test.alice, value: 1000000, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx);

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx);

        assertBalance (
          "test.patTokenSaleWrapper",
          800003, "Wei",
          test.patTokenSaleWrapper.address);

        assertBalance (
          "test.bob",
          1000000, "Wei",
          test.bob.address);
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 1000000 Wei",
      body: function (test) {
        assertBalance (
          "test.bob",
          1000000, "Wei",
          test.bob.address);

        assertBalance (
          "test.patTokenSaleWrapper",
          800003, "Wei",
          test.patTokenSaleWrapper.address);

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.bob.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.bob.address) [0])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [0])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.frank.address) [0]",
          false,
          test.patTokenSaleWrapper.doOutstandingTokens (test.frank.address) [0])

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.buy.getData (),
          1000000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded and sale finished",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.finalPrice = test.patTokenSaleWrapper.price (
          web3.eth.getBlock (
            web3.eth.getTransactionReceipt (test.tx).blockNumber).timestamp);

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Investment",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Investment,
          test.tx,
          { investor: test.bob.address, amount: 199997 });

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx,
          { finalPrice: test.finalPrice });

        assertBalance (
          "test.bob",
          800003, "Wei",
          test.bob.address);

        assertBalance (
          "test.patTokenSaleWrapper",
          1000000, "Wei",
          test.patTokenSaleWrapper.address);

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.bob.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.bob.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.bob.address) [1]",
          web3.toBigNumber (299997).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (test.finalPrice),
          test.patTokenSaleWrapper.doOutstandingTokens (test.bob.address) [1])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [1]",
          web3.toBigNumber (350000).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (test.finalPrice),
          test.patTokenSaleWrapper.doOutstandingTokens (test.carol.address) [1])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [1]",
          web3.toBigNumber (102500).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (test.finalPrice),
          test.patTokenSaleWrapper.doOutstandingTokens (test.dave.address) [1])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [1]",
          web3.toBigNumber (309500).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (test.finalPrice),
          test.patTokenSaleWrapper.doOutstandingTokens (test.elly.address) [1])

        assertEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.frank.address) [0]",
          true,
          test.patTokenSaleWrapper.doOutstandingTokens (test.frank.address) [0])

        assertBNEquals (
          "test.patTokenSaleWrapper.doOutstandingTokens (test.frank.address) [1]",
          web3.toBigNumber (3).
            mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
              divToInt (test.finalPrice),
          test.patTokenSaleWrapper.doOutstandingTokens (test.frank.address) [1])
      }},
    { name: "Bob tries to finish sale, but sale is already finished",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.finishSale.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Finished",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Finished,
          test.tx);
      }},
    { name: "Dave tries to initiate token delivery to Carol but token transfers are not allowed",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.carol.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded but no tokens were delivered",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx);
      }},
    { name: "Dave initiate token delivery to Frank",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.frank.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded and zero tokens were deivered",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx);
      }},
    { name: "Dave tries to initiate token delivery to Frank, but tokens are already delivered to Frank",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.frank.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx);

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx);
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.simpleToken.setTransfersEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Dave initiates token delivery to Carol",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.carol.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.carol.address,
            _value: web3.toBigNumber (350000).
              mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
                divToInt (test.finalPrice)
          });
      }},
    { name: "Dave tries to initiate token delivery to Carol but tokens are already delivered to her",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.carol.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: false });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx);

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx);
      }},
    { name: "Dave initiates token delivery to Bob",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.bob.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.bob.address,
            _value: web3.toBigNumber (300000).
              mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
                divToInt (test.finalPrice)
          });
      }},
    { name: "Dave initiates token delivery to himself",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.dave.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.dave.address,
            _value: web3.toBigNumber (102500).
              mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
                divToInt (test.finalPrice)
          });
      }},
    { name: "Dave initiates token delivery to Elly",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.elly.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.dave.Result",
          test.dave,
          test.dave.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.patTokenSaleWrapper.Result",
          test.patTokenSaleWrapper,
          test.patTokenSaleWrapper.Result,
          test.tx,
          { _value: true });

        assertEvents (
          "test.simpleToken.Transfer",
          test.simpleToken,
          test.simpleToken.Transfer,
          test.tx,
          {
            _from: test.bob.address,
            _to: test.elly.address,
            _value: web3.toBigNumber (309500).
              mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
                divToInt (test.finalPrice)
          });
      }},
    { name: "Alice tells Bob to reject payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          false,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to initiate revenue collection but she is not the owner of the smart contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.collectRevenue.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });
      }},
    { name: "Dave initiates token delivery to Elly",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.dave.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.deliver.getData (test.elly.address),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Bob initiates revenue collection, but Bob does not accept payments",
      body: function (test) {
        assertBalance (
          "test.bob.address",
          800003, "Wei",
          test.bob.address);

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.collectRevenue.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assertBalance (
          "test.bob.address",
          800003, "Wei",
          test.bob.address);

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob initiates revenue collection",
      body: function (test) {
        assertBalance (
          "test.bob.address",
          800003, "Wei",
          test.bob.address);

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.collectRevenue.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assertBalance (
          "test.bob.address",
          1800003, "Wei",
          test.bob.address);

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Bob tries to destroys smart contract but sale period didn't end yet",
      body: function (test) {
        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.destroy.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Alice sets sale start time to now - 31 days",
      body: function (test) {
        var now = Math.floor (Date.now() / 1000);

        test.saleStartTime = now - 31 * 24 * 3600;

        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setSaleStartTime (
          test.saleStartTime,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol tries to destroys smart contract but she is not the owner of the smart contract",
      body: function (test) {
        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.destroy.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { _value: false });

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Alice unfinishes sale",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.unfinishSale (
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to destroys smart contract but sale is not finished yet",
      body: function (test) {
        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.destroy.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Bob finishes sale",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.finishSale.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
        precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

      }},
    { name: "Alice deposits 1 Wei to smart contract",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.deposit (
          {from: test.alice, value: 1, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to destroys smart contract but smart contract balance is not zero",
      body: function (test) {
        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.destroy.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Alice withdraws ether from smart contract balance",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.withdraw (
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice sets total invested value to 1 Wei",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setTotalInvested (
          1,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob tries to destroys smart contract but not all tokens were delivered to investors",
      body: function (test) {
        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.destroy.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction failed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: false });

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);
      }},
    { name: "Alice sets total invested value to zero",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.patTokenSaleWrapper.setTotalInvested (
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob destroys smart contract",
      body: function (test) {
        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length > 2);

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.patTokenSaleWrapper.address,
          test.patTokenSaleWrapper.destroy.getData (),
          0,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { _value: true });

        assert (
          "test.patTokenSaleWrapper",
          web3.eth.getCode (test.patTokenSaleWrapper.address).length == 2);
      }}
  ]});
