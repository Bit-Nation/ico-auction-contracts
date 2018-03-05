/*
 * Wrapper for Math Utilities Smart Contract.
 * Copyright © 2017 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */
pragma solidity ^0.4.16;

import "./../../src/sol/Math.sol";

/**
 * Wrapper for Math Utilities smart contract..
 */
contract MathWrapper is Math {
  /**
   * Return index of most significant non-zero bit in given non-zero 256-bit
   * unsigned integer value.
   *
   * @param x value to get index of most significant non-zero bit in
   * @return index of most significant non-zero bit in given number
   */
  function doMostSignificantBit (uint256 x) pure public returns (bool, uint8) {
    return (true, mostSignificantBit (x));
  }

  /**
   * Calculate log_2 (x / 2^128) * 2^128.
   *
   * @param x parameter value
   * @return log_2 (x / 2^128) * 2^128
   */
  function doLog_2 (uint256 x) pure public returns (bool, int256) {
    return (true, log_2 (x));
  }

  /**
   * Calculate ln (x / 2^128) * 2^128.
   *
   * @param x parameter value
   * @return ln (x / 2^128) * 2^128
   */
  function doLn (uint256 x) pure public returns (bool, int256) {
    return (true, ln (x));
  }

  /**
   * Calculate x * y / 2^128.
   *
   * @param x parameter x
   * @param y parameter y
   * @return x * y / 2^128
   */
  function doFPMul (uint256 x, uint256 y) pure public returns (bool, uint256) {
    return (true, fpMul (x, y));
  }

  /**
   * Calculate x * y.
   *
   * @param x parameter x
   * @param y parameter y
   * @return high and low words of x * y
   */
  function doLongMul (uint256 x, uint256 y)
    pure public returns (bool, uint256 h, uint256 l) {
    (h, l) = longMul (x, y);
    return (true, h, l);
  }

  /**
   * Calculate x * y / 2^128.
   *
   * @param x parameter x
   * @param y parameter y
   * @return x * y / 2^128
   */
  function doFPMulI (int256 x, int256 y) pure public returns (bool, int256) {
    return (true, fpMulI (x, y));
  }

  /**
   * Calculate x + y, throw in case of over-/underflow.
   *
   * @param x parameter x
   * @param y parameter y
   * @return x + y
   */
  function doSafeAddI (int256 x, int256 y) pure public returns (bool, int256) {
    return (true, safeAddI (x, y));
  }

  /**
   * Calculate x / y * 2^128.
   *
   * @param x parameter x
   * @param y parameter y
   * @return  x / y * 2^128
   */
  function doFPDiv (uint256 x, uint256 y) pure public returns (bool, uint256) {
    return (true, fpDiv (x, y));
  }
}
