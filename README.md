# Oracles PoA initial keys generation script

## Install node.js
Install [nodejs](https://nodejs.org/en/download/package-manager/)

## Generation of new initial keys

- Install required packages `npm install`
- If run on your local machine, edit `config.json` and set `Ethereum.live.rpc` property to `"http://$BOOTNODE_IP:8540"`. If run from bootnode itself, skip this step.
- `node ./generateInitialKey.js`
-  Send 2 transactions in Parity `http://$BOOTNODE_IP:8180/` with contract owner

  (i) addition of initial key to Oracles contract
  
  (ii) transfer of 0.1Eth to added initial key

Expected result:

```
Initial key 0x87955e8a4c1887cbfcc79950620162eec89ac87b is generated to ./initialKeysDemo/87955e8a4c1887cbfcc79950620162eec89ac87b.json
Password for initial key: jJ4NqPeUpxE3kIhlBjq9
Estimated gas to add initial key: 50346
Wait tx 0xbc2c717245950b4492884b1525a14968acfe73d426111d1ed8c30a64a0f7dfe4 to add initial key to be mined...
Initial key 0x87955e8a4c1887cbfcc79950620162eec89ac87b is added to contract
WEI to send to initial key: 100000000000000000
Wait tx to send Eth to initial key to be mined...
0.1 Eth sent to initial key

```
