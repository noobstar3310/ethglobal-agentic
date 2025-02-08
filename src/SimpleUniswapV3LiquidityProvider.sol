// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
pragma abicoder v2;

import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV3Pool.sol";
import "./interfaces/IUniswapV3MintCallback.sol";

contract SimpleUniswapV3LiquidityProvider is IUniswapV3MintCallback {
    address public immutable pool;
    address public immutable token0;
    address public immutable token1;
    int24 public immutable tickLower = -887220;
    int24 public immutable tickUpper = 887220;
    uint128 public immutable amount = 792675550209951;
    uint256 public immutable amount0Max = 100000000000000;
    uint256 public immutable amount1Max = 6283345279006499;

    constructor(address _pool) {
        pool = _pool;
        token0 = IUniswapV3Pool(_pool).token0();
        token1 = IUniswapV3Pool(_pool).token1();
    }

    function provideLiquidity() external // int24 tickLower,
    // int24 tickUpper,
    // uint128 amount,
    // uint256 amount0Max,
    // uint256 amount1Max
    {
        // Transfer maximum amounts from user to this contract
        IERC20(token0).transferFrom(msg.sender, address(this), amount0Max);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1Max);

        // Approve pool to spend tokens
        IERC20(token0).approve(pool, amount0Max);
        IERC20(token1).approve(pool, amount1Max);

        // Mint position
        (uint256 amount0, uint256 amount1) = IUniswapV3Pool(pool).mint(
            msg.sender, // recipient of the position
            tickLower,
            tickUpper,
            amount,
            abi.encode(msg.sender)
        );

        // Refund excess tokens to user
        if (amount0 < amount0Max) {
            IERC20(token0).transfer(msg.sender, amount0Max - amount0);
        }
        if (amount1 < amount1Max) {
            IERC20(token1).transfer(msg.sender, amount1Max - amount1);
        }
    }

    /// @notice Callback for Uniswap V3 pool mint
    function uniswapV3MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata /* data */ // commented out unused parameter
    ) external override {
        require(msg.sender == pool, "CB");

        // Transfer the requested amounts to the pool
        if (amount0Owed > 0) {
            IERC20(token0).transfer(msg.sender, amount0Owed);
        }
        if (amount1Owed > 0) {
            IERC20(token1).transfer(msg.sender, amount1Owed);
        }
    }

    /// @notice Helper function to remove liquidity
    function removeLiquidity(
        int24 tickLower,
        int24 tickUpper,
        uint128 amount
    ) external {
        // Burn the position
        (uint256 amount0, uint256 amount1) = IUniswapV3Pool(pool).burn(
            tickLower,
            tickUpper,
            amount
        );

        // Collect the tokens
        IUniswapV3Pool(pool).collect(
            msg.sender,
            tickLower,
            tickUpper,
            uint128(amount0),
            uint128(amount1)
        );
    }
}
