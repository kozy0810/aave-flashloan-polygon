//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./aave/FlashLoanSimpleReceiverBase.sol";
import "./aave/IFlashLoanSimpleReceiver.sol";

import "./uniswap/IUniswapV2Router.sol";
import "./uniswap/v3/ISwapRouter.sol";

import "./curveFi/ICurveFi.sol";

import "./dodo/IDODO.sol";
import "./dodo/IDODOProxy.sol";

import "./interfaces/IFlashloan.sol";

import "./libraries/Part.sol";
import "./FlashloanValidation.sol";

import "hardhat/console.sol";

contract Flashloan is IFlashloan, FlashLoanSimpleReceiverBase, FlashloanValidation, Ownable {
    address AAVEPoolAddress;
    ICurveFi curveFi;

    constructor(IPoolAddressesProvider _provider)
    FlashLoanSimpleReceiverBase(_provider)
    {
        AAVEPoolAddress = address(_provider);
    }

    function aaveFlashLoan(FlashloanParams calldata _params) external onlyOwner {
        bytes memory data = abi.encode(
            FlashloanParams({
                flashLoanPool: _params.flashLoanPool,
                loanToken: _params.loanToken,
                loanAmount: _params.loanAmount,
                routes: _params.routes
            })
        );

        POOL.flashLoanSimple(
            address(this),
            _params.loanToken,
            _params.loanAmount,
            data,
            0
        );

        uint256 profit = IERC20(_params.loanToken).balanceOf(address(this));
        // console.log("profit", profit);
        require(
            IERC20(_params.loanToken).transfer(msg.sender, profit),
            "aaveFlashLoan: Could not transfer back the profit"
        );
    }

    function executeOperation(
        address _asset,
        uint256 _amount,
        uint256 _premium,
        address _initiator,
        bytes calldata _params
    ) external override returns (bool) {
        console.log("initiator: ", _initiator);

        FlashloanParams memory data = abi.decode(
            _params,
            (FlashloanParams)
        );

        routeLoop(data.routes, _amount);

        console.log("refound total: ", _amount+_premium);
        console.log("balance: ", ERC20(_asset).balanceOf(address(this)));
        ERC20(_asset).approve(address(AAVEPoolAddress), _amount+_premium);
        // uint totalDebt = _amount.add(_fee);
        // transferFundsBackToPoolInternal(_reserve, totalDebt);

        // getBalanceInternal(address(this), _amount);

        // transferFundsBackToPoolInternal(_amount, );

        return true;
    }

    function routeLoop(
        Route[] memory routes,
        uint256 totalAmount
    ) internal checkTotalRoutePart(routes) {
        for (uint256 i = 0; i < routes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(routes[i].part, totalAmount);
            hopLoop(routes[i], amountIn);
        }
    }

    function hopLoop(Route memory route, uint256 totalAmount) internal {
        uint256 amountIn = totalAmount;
        for (uint256 i = 0; i < route.hops.length; i++) {
            amountIn = pickProtocol(route.hops[i], amountIn);
        }
    }

    function pickProtocol(
        Hop memory hop,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        if (hop.protocol == 0) {
            amountOut = uniswapV3(hop.data, amountIn, hop.path);
            console.log("amountOut", amountOut);
        } else if (hop.protocol < 8) {
            amountOut = uniswapV2(hop.data, amountIn, hop.path);
        } else {
            amountOut = dodoV2Swap(hop.data, amountIn, hop.path);
        }
    }

    function uniswapV2(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        address router = abi.decode(data, (address));
        console.log("path[0]: ", path[0]);
        console.log("router: ", router);
        console.log("amountIn: ", amountIn);
        approveToken(path[0], router, amountIn);
        return
            IUniswapV2Router(router).swapExactTokensForTokens(
                amountIn,
                1,
                path,
                address(this),
                block.timestamp
            )[1];
    }

    function uniswapV3(
        bytes memory _data,
        uint256 _amountIn,
        address[] memory _path
    ) internal returns (uint256 amountOut) {
        (address router, uint24 fee) = abi.decode(_data, (address, uint24));
        ISwapRouter swapRouter = ISwapRouter(router);
        approveToken(_path[0], address(swapRouter), _amountIn);

        // single swaps
        amountOut = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: _path[0],
                tokenOut: _path[1],
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
    }

    function dodoV2Swap(
        bytes memory _data,
        uint256 _amountIn,
        address[] memory _path
    ) internal returns (uint256 amountOut) {
        (address dodoV2Pool, address dodoApprove, address dodoProxy) = abi
            .decode(_data, (address, address, address));
        address[] memory dodoPairs = new address[](1); //one-hop
        dodoPairs[0] = dodoV2Pool;
        uint256 directions = IDODO(dodoV2Pool)._BASE_TOKEN_() == _path[0]
            ? 0
            : 1;
        approveToken(_path[0], dodoApprove, _amountIn);
        amountOut = IDODOProxy(dodoProxy).dodoSwapV2TokenToToken(
            _path[0],
            _path[1],
            _amountIn,
            1,
            dodoPairs,
            directions,
            false,
            block.timestamp
        );
    }

    function curve(
        address pool,
        int128 _reserve,
        int128 _tokenB,
        uint256 _dx
    ) internal {
        curveFi = ICurveFi(pool);
        curveFi.exchange_underlying(
            _reserve,
            _tokenB,
            _dx,
            0
        );
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "Flashloan: approve failed.");
    }
}