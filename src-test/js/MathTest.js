/*
 * Test for PAT Token Sale Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "Math",
  steps: [
    { name: "Ensure there is at least three accounts: Alice",
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
    { name: "Alice deploys MathWrapper contract",
      body: function (test) {
        test.mathWrapperContract =
          loadContract ("MathWrapper");
        var mathWrapperCode =
          loadContractCode ("MathWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.mathWrapperContract.new (
          {from: test.alice, data: mathWrapperCode, gas:3000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getTransactionReceipt (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.mathWrapper = getDeployedContract (
          "MathWrapper",
          test.mathWrapperContract,
          test.tx);
      }},
    { name: "Test mostSignificantBit function",
      body: function (test) {
        assertEquals (
          "test.mathWrapper.doMostSignificantBit (0) [0]",
          false,
          test.mathWrapper.doMostSignificantBit (0) [0]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit (1) [0]",
          true,
          test.mathWrapper.doMostSignificantBit (1) [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit (1) [1]",
          0,
          test.mathWrapper.doMostSignificantBit (1) [1]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit (2) [0]",
          true,
          test.mathWrapper.doMostSignificantBit (2) [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit (2) [1]",
          1,
          test.mathWrapper.doMostSignificantBit (2) [1]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit (3) [0]",
          true,
          test.mathWrapper.doMostSignificantBit (3) [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit (3) [1]",
          1,
          test.mathWrapper.doMostSignificantBit (3) [1]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit (4) [0]",
          true,
          test.mathWrapper.doMostSignificantBit (4) [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit (4) [1]",
          2,
          test.mathWrapper.doMostSignificantBit (4) [1]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit ('0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [0]",
          true,
          test.mathWrapper.doMostSignificantBit ('0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit ('0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [1]",
          254,
          test.mathWrapper.doMostSignificantBit ('0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [1]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit ('0x8000000000000000000000000000000000000000000000000000000000000000') [0]",
          true,
          test.mathWrapper.doMostSignificantBit ('0x8000000000000000000000000000000000000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit ('0x8000000000000000000000000000000000000000000000000000000000000000') [1]",
          255,
          test.mathWrapper.doMostSignificantBit ('0x8000000000000000000000000000000000000000000000000000000000000000') [1]);

        assertEquals (
          "test.mathWrapper.doMostSignificantBit ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [0]",
          true,
          test.mathWrapper.doMostSignificantBit ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [0]);

        assertBNEquals (
          "test.mathWrapper.doMostSignificantBit ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [1]",
          255,
          test.mathWrapper.doMostSignificantBit ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [1]);
      }},
    { name: "Test log_2 function",
      body: function (test) {
        assertEquals (
          "test.mathWrapper.doLog_2 (0) [0]",
          false,
          test.mathWrapper.doLog_2 (0) [0]);

        assertEquals (
          "test.mathWrapper.doLog_2 (1) [0]",
          true,
          test.mathWrapper.doLog_2 (1) [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (1) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          -128,
          test.mathWrapper.doLog_2 (1) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (2) [0]",
          true,
          test.mathWrapper.doLog_2 (2) [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (2) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          -127,
          test.mathWrapper.doLog_2 (2) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (3) [0]",
          true,
          test.mathWrapper.doLog_2 (3) [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (3) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '-126.41503749927884381854',
          test.mathWrapper.doLog_2 (3) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (4) [0]",
          true,
          test.mathWrapper.doLog_2 (4) [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (4) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          -126,
          test.mathWrapper.doLog_2 (4) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (0x100000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLog_2 ('0x100000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (0x100000000000000000000000000000000) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          0,
          test.mathWrapper.doLog_2 ('0x100000000000000000000000000000000') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (0x180000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLog_2 ('0x180000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (0x180000000000000000000000000000000) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '0.58496250072115618145',
          test.mathWrapper.doLog_2 ('0x180000000000000000000000000000000') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (0x300000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLog_2 ('0x300000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (0x300000000000000000000000000000000) [1]",
          '0x195c01a39fbd6879fa00b120a068badd1',
          test.mathWrapper.doLog_2 ('0x300000000000000000000000000000000') [1]);

        assertEquals (
          "test.mathWrapper.doLog_2 (0x12C00000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLog_2 ('0x12C00000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (0x12C00000000000000000000000000000000) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '8.22881869049588087719',
          test.mathWrapper.doLog_2 ('0x12C00000000000000000000000000000000') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (0x8000000000000000000000000000000000000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLog_2 ('0x8000000000000000000000000000000000000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (0x8000000000000000000000000000000000000000000000000000000000000000) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          127,
          test.mathWrapper.doLog_2 ('0x8000000000000000000000000000000000000000000000000000000000000000') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLog_2 (0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) [0]",
          true,
          test.mathWrapper.doLog_2 ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [0]);

        assertBNEquals (
          "test.mathWrapper.doLog_2 (0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '127.99999999999999999999',
          test.mathWrapper.doLog_2 ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));
      }},
    { name: "Test ln function",
      body: function (test) {
        assertEquals (
          "test.mathWrapper.doLn (0) [0]",
          false,
          test.mathWrapper.doLn (0) [0]);

        assertEquals (
          "test.mathWrapper.doLn (1) [0]",
          true,
          test.mathWrapper.doLn (1) [0]);

        assertBNEquals (
          "test.mathWrapper.doLn (1) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '-88.7228391116729996054',
          test.mathWrapper.doLn (1) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLn (0x100000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLn ('0x100000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLn (0x100000000000000000000000000000000) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          0,
          test.mathWrapper.doLn ('0x100000000000000000000000000000000') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLn (0x300000000000000000000000000000000) [0]",
          true,
          test.mathWrapper.doLn ('0x300000000000000000000000000000000') [0]);

        assertBNEquals (
          "test.mathWrapper.doLn (0x300000000000000000000000000000000) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '1.09861228866810969139',
          test.mathWrapper.doLn ('0x300000000000000000000000000000000') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));

        assertEquals (
          "test.mathWrapper.doLn (0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) [0]",
          true,
          test.mathWrapper.doLn ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [0]);

        assertBNEquals (
          "test.mathWrapper.doLn (0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) [1].div (web3.toBigNumber ('0x100000000000000000000000000000000'))",
          '88.7228391116729996054',
          test.mathWrapper.doLn ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF') [1].div (web3.toBigNumber ('0x100000000000000000000000000000000')));
      }},
    { name: "fpMul",
      body: function (test) {
        var values = [
          web3.toBigNumber ("0"),
          web3.toBigNumber ("1"),
          web3.toBigNumber ("2"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("0x100000000000000000000000000000000"),
          web3.toBigNumber ("0x100000000000000000000000000000001"),
          web3.toBigNumber ("0x100000000000000000000000000000002"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")];

        for (var i = 0; i < values.length; i++) {
          for (var j = 0; j < values.length; j++) {
            var x = values [i];
            var y = values [j];
            var expected =
              x.mul (y).
              divToInt (
                web3.toBigNumber ("0x100000000000000000000000000000000"));

            if (expected.gt (web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")))
              expected = null;

            assertEquals (
              "test.mathWrapper.doFPMul (" + x.toString (16) + ", " + y.toString (16) + ") [0]",
              expected != null,
              test.mathWrapper.doFPMul (x, y) [0]);

            if (expected != null) {
              assertBNEquals (
                "test.mathWrapper.doFPMul (" + x.toString (16) + ", " + y.toString (16) + ") [1]",
                expected,
                test.mathWrapper.doFPMul (x, y) [1]);
            }
          }
        }
      }},
    { name: "longMul",
      body: function (test) {
        var values = [
          web3.toBigNumber ("0"),
          web3.toBigNumber ("1"),
          web3.toBigNumber ("2"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("0x100000000000000000000000000000000"),
          web3.toBigNumber ("0x100000000000000000000000000000001"),
          web3.toBigNumber ("0x100000000000000000000000000000002"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")];

        for (var i = 0; i < values.length; i++) {
          for (var j = 0; j < values.length; j++) {
            var x = values [i];
            var y = values [j];
            var expected = x.mul (y);

            assertEquals (
              "test.mathWrapper.doLongMul (" + x.toString (16) + ", " + y.toString (16) + ") [0]",
              true,
              test.mathWrapper.doLongMul (x, y) [0]);

            assertBNEquals (
              "test.mathWrapper.doLongMul (" + x.toString (16) + ", " + y.toString (16) + ") [1]",
              expected.divToInt (web3.toBigNumber ("0x10000000000000000000000000000000000000000000000000000000000000000")),
              test.mathWrapper.doLongMul (x, y) [1]);

            assertBNEquals (
              "test.mathWrapper.doLongMul (" + x.toString (16) + ", " + y.toString (16) + ") [2]",
              expected.mod (web3.toBigNumber ("0x10000000000000000000000000000000000000000000000000000000000000000")),
              test.mathWrapper.doLongMul (x, y) [2]);
          }
        }
      }},
    { name: "fpMulI",
      body: function (test) {
        var values = [
          web3.toBigNumber ("-0x8000000000000000000000000000000000000000000000000000000000000000"),
          web3.toBigNumber ("-0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("-0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("-0x100000000000000000000000000000001"),
          web3.toBigNumber ("-0x100000000000000000000000000000000"),
          web3.toBigNumber ("-0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("-0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("-2"),
          web3.toBigNumber ("-1"),
          web3.toBigNumber ("0"),
          web3.toBigNumber ("1"),
          web3.toBigNumber ("2"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("0x100000000000000000000000000000000"),
          web3.toBigNumber ("0x100000000000000000000000000000001"),
          web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD"),
          web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")];

        for (var i = 0; i < values.length; i++) {
          for (var j = 0; j < values.length; j++) {
            var x = values [i];
            var y = values [j];
            var expected =
              x.mul (y).
              divToInt (
                web3.toBigNumber ("0x100000000000000000000000000000000"));

            if (expected.lt (web3.toBigNumber ("-0x8000000000000000000000000000000000000000000000000000000000000000")) ||
                expected.gt (web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")))
              expected = null;

            assertEquals (
              "test.mathWrapper.doFPMulI (" + x.toString (16) + ", " + y.toString (16) + ") [0]",
              expected != null,
              test.mathWrapper.doFPMulI (x, y) [0]);

            if (expected != null) {
              var r = test.mathWrapper.doFPMulI (x, y) [1];
              if (r.lt (web3.toBigNumber ('-0x8000000000000000000000000000000000000000000000000000000000000000')))
                r = r.sub (web3.toBigNumber ('-0x10000000000000000000000000000000000000000000000000000000000000000'));

              assertBNEquals (
                "test.mathWrapper.doFPMulI (" + x.toString (16) + ", " + y.toString (16) + ") [1]",
                expected,
                r);
            }
          }
        }
      }},
    { name: "safeAddI",
      body: function (test) {
        var values = [
          web3.toBigNumber ("-0x8000000000000000000000000000000000000000000000000000000000000000"),
          web3.toBigNumber ("-0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("-0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("-0x100000000000000000000000000000001"),
          web3.toBigNumber ("-0x100000000000000000000000000000000"),
          web3.toBigNumber ("-0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("-0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("-2"),
          web3.toBigNumber ("-1"),
          web3.toBigNumber ("0"),
          web3.toBigNumber ("1"),
          web3.toBigNumber ("2"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("0x100000000000000000000000000000000"),
          web3.toBigNumber ("0x100000000000000000000000000000001"),
          web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD"),
          web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")];

        for (var i = 0; i < values.length; i++) {
          for (var j = 0; j < values.length; j++) {
            var x = values [i];
            var y = values [j];
            var expected = x.add (y);

            if (expected.lt (web3.toBigNumber ("-0x8000000000000000000000000000000000000000000000000000000000000000")) ||
                expected.gt (web3.toBigNumber ("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")))
              expected = null;

            assertEquals (
              "test.mathWrapper.doSafeAddI (" + x.toString (16) + ", " + y.toString (16) + ") [0]",
              expected != null,
              test.mathWrapper.doSafeAddI (x, y) [0]);

            if (expected != null) {
              var r = test.mathWrapper.doSafeAddI (x, y) [1];
              if (r.lt (web3.toBigNumber ('-0x8000000000000000000000000000000000000000000000000000000000000000')))
                r = r.sub (web3.toBigNumber ('-0x10000000000000000000000000000000000000000000000000000000000000000'));

              assertBNEquals (
                "test.mathWrapper.doSafeAddI (" + x.toString (16) + ", " + y.toString (16) + ") [1]",
                expected,
                r);
            }
          }
        }
      }},
    { name: "fpDiv",
      body: function (test) {
        var values = [
          web3.toBigNumber ("0"),
          web3.toBigNumber ("1"),
          web3.toBigNumber ("2"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          web3.toBigNumber ("0x100000000000000000000000000000000"),
          web3.toBigNumber ("0x100000000000000000000000000000001"),
          web3.toBigNumber ("0x100000000000000000000000000000002"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE"),
          web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")];

        for (var i = 0; i < values.length; i++) {
          for (var j = 0; j < values.length; j++) {
            var x = values [i];
            var y = values [j];
            var expected;
            
            if (y.eq (web3.toBigNumber ("0"))) {
              expected = null;
            } else {
              expected = 
                x.mul (web3.toBigNumber ("0x100000000000000000000000000000000")).
                  divToInt (y);

              if (expected.gt (web3.toBigNumber ("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")))
                expected = null;
            }

            assertEquals (
              "test.mathWrapper.doFPDiv (" + x.toString (16) + ", " + y.toString (16) + ") [0]",
              expected != null,
              test.mathWrapper.doFPDiv (x, y) [0]);

            if (expected != null) {
              assertBNEquals (
                "test.mathWrapper.doFPDiv (" + x.toString (16) + ", " + y.toString (16) + ") [1]",
                expected,
                test.mathWrapper.doFPDiv (x, y) [1]);
            }
          }
        }
      }}
  ]});
