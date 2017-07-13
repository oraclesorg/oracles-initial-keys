# Oracles PoA initial keys generation script

## Install node.js
Install [nodejs](https://nodejs.org/en/download/package-manager/)

## Generation of new initial keys

- Install required packages `npm install` 
- `node ./generateInitialKey.js`
-  Send 2 transactions in Parity `http://$BOOTNODE_IP:8180/` with contract owner

  (i) addition of initial key to Oracles contract
  
  (ii) transfer of 0.1Eth to added initial key

Expected result:

```
Initial key generated to ./initialKeysDemo/489d0379c2cc40bffd48a9c99e5f65fd7ddb0ed5.json
Password for initial key: goW2klc1
0x489d0379c2cc40bffd48a9c99e5f65fd7ddb0ed5
Wait tx to add initial key to be mined...
Initial key 0x489d0379c2cc40bffd48a9c99e5f65fd7ddb0ed5 added to contract
Wait tx to send Eth to initial key to be mined...
0.01 Eth sent to initial key
```
