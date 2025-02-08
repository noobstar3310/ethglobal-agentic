// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Factory {
    function allPairs(uint) external view returns (address);

    function allPairsLength() external view returns (uint);
}

interface IUniswapV2Pair {
    function token0() external view returns (address);

    function token1() external view returns (address);
}

interface IERC20 {
    function name() external view returns (string memory);
}

contract UniswapV2Scanner {
    address public factory;

    constructor(address _factory) {
        factory = _factory;
    }

    function getAllPairs() public view returns (address[] memory) {
        uint256 length = IUniswapV2Factory(factory).allPairsLength();
        address[] memory lpContracts = new address[](length);

        for (uint i = 1; i < length; i++) {
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
}
