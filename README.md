# Smart Contract API Example

Example code for building your own Ethereum smart contract API in [Node.js](https://nodejs.org/en/download/).

## Setup

```
git clone https://github.com/mcankalx/CTokenDetailsFinder.git
cd api-guide-example
npm install
```

**config.json**

The listed contract addresses and ABIs might be out of date. They can be confirmed here https://compound.finance/docs#networks.

**server.js**

1. Be sure to set an environment variable for the Ethereum wallet private key.
2. Replace the HTTP Provider URL with your own. [Infura provides free API keys](https://infura.io/).

```js
const walletPrivateKey = process.env.walletPrivateKey;
const web3 = new Web3('https://mainnet.infura.io/v3/_your_api_key_here_');
```

## Running

```
node server.js
```
