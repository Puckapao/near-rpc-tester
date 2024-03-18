## NEAR RPC TESTER
This is experimental script to explore NEAR's RPC APIs and interacti with it. Please use with caution.

> [!CAUTION]
> This is only for testnet, not recommend for mainnet use. And it requires private key of sender wallet, so please use burner wallets.

------------
## INSTALLATION
0. Install [Node.js](https://nodejs.org/en/download/) and [Git](https://git-scm.com/downloads)

1. Clone the repository
```
git clone https://github.com/Puckapao/near-rpc-tester.git && cd near-rpc-tester
```

2. Install dependencies (Requires Node and Npm)
```
npm install
```

3. Modify configs
```
cp .env.sample .env
```

4. Run the script
```
npm near.js
```
------------
## CONFIGS
```ID```            = "Sender wallet's ID" ie. "sender.wallet"

```PRIVATE_KEY```   = "Sender wallet's private key"

```RPC```           = "RPC URL"

```RECEIVER```      = "Receiver wallet's ID" ie. "reciever.testnet"

```MAX_AMOUNT```    = "Max token to send each time" ie. 1000000000000000000000 = 0.0001

```MIN_INTERVAL```  = Minimum of interval time, Will be used in random interval time

```MAX_INTERVAL```  = Maximum of interval time, Will be used in random interval time
