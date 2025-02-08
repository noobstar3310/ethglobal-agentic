// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Factory {
    function allPairs(uint) external view returns (address);

    function allPairsLength() external view returns (uint);
}

interface IUniswapV2Pair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function totalSupply() external view returns (uint);

    function balanceOf(address owner) external view returns (uint);

    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IERC20 {
    function name() external view returns (string memory);
}

contract APY {
    address public factory;
    uint256 public constant TRADING_FEE = 3; // Uniswap V2 0.3% fee
    uint256 public constant DAYS_IN_YEAR = 365;
    uint256 public constant PRECISION = 1e18; // Precision factor

    constructor(address _factory) {
        factory = _factory;
    }

    function getAllPairs() public view returns (address[] memory) {
        uint256 length = IUniswapV2Factory(factory).allPairsLength();
        address[] memory lpContracts = new address[](length);

        for (uint i = 0; i < length; i++) {
            lpContracts[i] = IUniswapV2Factory(factory).allPairs(i);
        }

        return lpContracts;
    }

    function getPairInfo(
        uint index
    ) public view returns (address pair, string memory pairName) {
        uint256 length = IUniswapV2Factory(factory).allPairsLength();
        require(index < length, "Index out of bounds");

        pair = IUniswapV2Factory(factory).allPairs(index);
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();

        string memory name0 = IERC20(token0).name();
        string memory name1 = IERC20(token1).name();

        pairName = string(abi.encodePacked(name0, "/", name1));
    }

    function getLiquidityShare(
        address pair,
        address user
    ) public view returns (uint256 userShareBP) {
        uint256 totalSupply = IUniswapV2Pair(pair).totalSupply();
        uint256 userBalance = IUniswapV2Pair(pair).balanceOf(user);
        require(totalSupply > 0, "No liquidity in pool");
        userShareBP = (userBalance * 10000) / totalSupply; // Basis points (1% = 100 BP)
    }

    function getDailyVolume(
        address pair
    ) public view returns (uint256 dailyVolume) {
        (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(pair)
            .getReserves();
        uint256 averageReserve = (uint256(reserve0) + uint256(reserve1)) / 2;
        dailyVolume = (averageReserve * TRADING_FEE) / 1000; // Approximate daily volume
    }

    function calculateAPY(
        address pair,
        uint256 dailyVolume,
        uint256 token0Price,
        uint256 token1Price
    ) public view returns (uint256 apy) {
        // Fetch reserves
        (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(pair)
            .getReserves();

        // Convert reserves to USD value
        uint256 totalLiquidity = (uint256(reserve0) * token0Price) +
            (uint256(reserve1) * token1Price);
        require(totalLiquidity > 0, "No liquidity in pool");

        // Calculate fee revenue (0.3% of daily volume)
        uint256 feeRevenue = (dailyVolume * TRADING_FEE) / 1000;

        // Compute the raw daily return (fee revenue as a percentage of liquidity)
        uint256 r = (feeRevenue * PRECISION) / totalLiquidity; // Convert to fixed-point

        // Approximate APY using (1 + r)^365 - 1 expansion
        uint256 r365 = r * DAYS_IN_YEAR;
        uint256 r365_2 = (r365 * r365) / (2 * PRECISION);
        uint256 r365_3 = (r365_2 * r365) / (3 * PRECISION);

        apy = r365 + r365_2 + r365_3; // Taylor series approximation
    }
}
