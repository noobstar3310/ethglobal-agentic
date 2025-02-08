// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
pragma abicoder v2;

import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV3Pool.sol";
import "./interfaces/IUniswapV3MintCallback.sol";

import "./library/TickMath.sol";

contract UniswapV3LiquidityProvider is IUniswapV3MintCallback {
    address public immutable pool;
    address public immutable token0;
    address public immutable token1;

    constructor(address _pool) {
        pool = _pool;
        token0 = IUniswapV3Pool(_pool).token0();
        token1 = IUniswapV3Pool(_pool).token1();
    }

    /// @notice Provides liquidity to the pool
    /// @param tickLower The lower tick of the range
    /// @param tickUpper The upper tick of the range
    /// @param amount0Desired The desired amount of token0
    /// @param amount1Desired The desired amount of token1
    function provideLiquidity(
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired
    ) external {
        // Approve pool to spend tokens
        IERC20(token0).approve(pool, amount0Desired);
        IERC20(token1).approve(pool, amount1Desired);

        // Transfer tokens from user to this contract
        IERC20(token0).transferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1Desired);

        // Calculate liquidity amount from desired amounts
        uint128 liquidity = calculateLiquidity(
            tickLower,
            tickUpper,
            amount0Desired,
            amount1Desired
        );

        // Mint position
        IUniswapV3Pool(pool).mint(
            msg.sender, // recipient of the position
            tickLower,
            tickUpper,
            liquidity,
            abi.encode(msg.sender) // pass sender address for callback verification
        );
    }

    /// @notice Callback for Uniswap V3 pool mint
    function uniswapV3MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external override {
        require(msg.sender == pool, "Callback only callable by pool");

        // Transfer the requested amounts to the pool
        if (amount0Owed > 0) {
            IERC20(token0).transfer(msg.sender, amount0Owed);
        }
        if (amount1Owed > 0) {
            IERC20(token1).transfer(msg.sender, amount1Owed);
        }
    }

    /// @notice Helper function to calculate liquidity amount
    function calculateLiquidity(
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired
    ) internal view returns (uint128) {
        // Get the current sqrt price and tick from the pool
        (uint160 sqrtPriceX96, int24 currentTick, , , , , ) = IUniswapV3Pool(
            pool
        ).slot0();

        // Calculate liquidity based on current price and desired amounts
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        // Return minimum liquidity that can be provided with desired amounts
        return
            uint128(
                Math.min(
                    (amount0Desired * sqrtRatioBX96 * sqrtRatioAX96) /
                        (sqrtRatioBX96 - sqrtRatioAX96),
                    (amount1Desired * (1 << 96)) /
                        (sqrtRatioBX96 - sqrtRatioAX96)
                )
            );
    }
}
