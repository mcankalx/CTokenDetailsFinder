const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const lodash = require('lodash');
const app = express();
const router = express.Router();
const url = require('url');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const fs = require('fs')
var cors = require('cors');

// Loading config files
const cAddressesConfig = require('./config/cAddresses_Config.json');
const appConfig = require('./config/app_Config.json');
const defaultConfig = appConfig.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = appConfig[environment];
const finalConfig = lodash.merge(defaultConfig, environmentConfig);

// as a best practice all global variables should be referenced via global syntax and their names should always begin with g
global.gConfig = finalConfig;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Initialising json object
var jsonData = {} // empty Object
var key = 'Balances';
jsonData[key] = []; // empty Array, which you can push() values into


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//Initialising private key variable
const walletPrivateKey = global.gConfig.walletPrivateKey;
//Initialising web3 object 
const web3 = new Web3('https://mainnet.infura.io/v3/4bdfcdc7dc064fbe81ed335e2706a32b');
web3.eth.accounts.wallet.add(walletPrivateKey);
var myWalletAddress = "";

const ethDecimals = 18;
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Handling the route calls
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Handling the route calls
app.route(global.gConfig.app_uri_ctokenbalance).get((req, res) => {
    myWalletAddress = req.query.address;
    let isValidEthAddress = Web3.utils.isAddress(myWalletAddress);
    console.log(isValidEthAddress);
    if (isValidEthAddress) {
        jsonData[key] = [];
        start(function() {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(jsonData, 0, 2));

        }).catch((err) => {
            console.error(err);
        });;
    } else {

        jsonData[key] = [];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(jsonData, 0, 2));
    }
});



async function start(callback) {
    const ethMantissa = 1e18;
    const blocksPerDay = 6570; // 13.15 seconds per block
    const daysPerYear = 365;

	// Initialing the Abi objects
    const cTokenAbi = global.gConfig.cTokenAbi;
    const erc20Abi = global.gConfig.erc20Abi;

    // Reading the cToken addresses config file
    let openJSON = fs.readFileSync('./config/cAddresses_Config.json', 'utf-8');
    let parseJSON = JSON.parse(openJSON);

    for (let i = 0; i < parseJSON.addresses.length; i++) {
		// Reading the token addresses from config file
        const cTokenAddress = parseJSON.addresses[i]["address"];
        const tokenAddress = parseJSON.addresses[i]["ercaddress"];

		// Initialing the contract objects
        const cToken = new web3.eth.Contract(cTokenAbi, cTokenAddress);
        const underlyingToken = new web3.eth.Contract(erc20Abi, tokenAddress);

		// Calculating the lending and supply APY rates
        const supplyRatePerBlock = await cToken.methods.supplyRatePerBlock().call();
        const borrowRatePerBlock = await cToken.methods.borrowRatePerBlock().call();
        var supplyApy = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        var borrowApy = (((Math.pow((borrowRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        supplyApy = roundToTwo(supplyApy);
        borrowApy = roundToTwo(borrowApy);
		
		// Fetching the balance of cToken for the provided wallet address and converting it to ether
        var balance = await cToken.methods.balanceOf(myWalletAddress).call();
        const etherValue = Web3.utils.fromWei(balance, 'ether');

		// Fetching the exchange rate
        var exchangeRateCurrent = await cToken.methods.exchangeRateCurrent().call();
        exchangeRateCurrent = exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8);

		// Fetching the underlying value
        const balanceOfUnderlying = web3.utils.toBN(await cToken.methods.balanceOfUnderlying(myWalletAddress).call()) / Math.pow(10, ethDecimals);

		// Calculating the redeem rate for underlying token
        const cTokenDecimals = 8; // all cTokens have 8 decimal places
        const underlyingDecimals = await underlyingToken.methods.decimals().call();
        const mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
        const oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);

		// Logging the values to console
        console.log(`Name ${parseJSON.addresses[i]["name"]}`);
        console.log(`Supply1 APY for ETH ${supplyApy} %`);
        console.log(`Borrow1 APY for ETH ${borrowApy} %`);
        console.log(`Balance ${etherValue}`);
        console.log(`CToken UnderlyingBalance ${balanceOfUnderlying}`);
        console.log(`One cToken Underlying ${oneCTokenInUnderlying}`);
        console.log(' --------------------------');
        console.log('');


        if (balance != 0) {
            var data = {
                cTokenName: parseJSON.addresses[i]["name"],
                cTokenAddress: cTokenAddress,
                WalletAddress: myWalletAddress,
                SupplyAPY: supplyApy,
                BorrowAPY: borrowApy,
                Balance: etherValue,
                RedeemRate: oneCTokenInUnderlying,
                BalanceOfUnderlying: balanceOfUnderlying

            };

            jsonData[key].push(data);
        }

    }
    callback();




}

// Function to round the umber to 2 decimals
function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

// Setting the cors for permitting to use the api from local domains
app.use(cors({
    origin: 'null'
}));



// setting the application to listen on port configured in the config file
const server = app.listen(process.env.PORT || global.gConfig.node_port, function() {
    const host = server.address().address
    const port = server.address().port
    console.log("Fetch Tweet Details app listening at %s", port)

})