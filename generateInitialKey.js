var fs = require('fs');
var keythereum = require("keythereum");
var Web3 = require('web3');

generateAddress(function(keyObject, password) {
	var filename = "./initialKeysDemo/" + keyObject.address + ".json";
	var content = JSON.stringify(keyObject);
	fs.writeFile(filename, content, function (err) {
	  if (err) return console.log(err);
	  console.log('Initial key generated to ' + filename);
	  console.log('Password for initial key: ' + password);
	  addInitialKey("0x" + keyObject.address, function(web3) {
	  	sendEtherToInitialKeyTX(web3, "0x" + keyObject.address, function(err, txHash) {
	  		if (err) {
	  			console.log("Something went wrong with sending Eth to initial key");
	  			console.log(err.message);
	  			return;
	  		}

	  		console.log("Wait tx to send Eth to initial key to be mined...");
			getTxCallBack(web3, txHash, function() {
				console.log("0.1 Eth sent to initial key");
			});
	  	});
	  });
	});
});

function getTxCallBack(web3, txHash, cb) {
	web3.eth.getTransaction(txHash, function(err, txDetails) {
  		if (err) {
  			console.log(err);
  		}
  		if (!txDetails.blockNumber) {
  			setTimeout(function() {
				getTxCallBack(web3, txHash, cb);
			}, 2000)
  		} else {
  			cb();
  		}
  	});
};

function generateAddress(cb) {
  var params = { keyBytes: 32, ivBytes: 16 };

  // synchronous
  var dk = keythereum.create(params);
  // dk:
  /*{
      privateKey: <Buffer ...>,
      iv: <Buffer ...>,
      salt: <Buffer ...>
  }*/

  // asynchronous
  keythereum.create(params, function (dk) {
    var options = {};
    var password = generatePassword();
    keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options, function (keyObject) {
      //keythereum.exportToFile(keyObject);
      cb(keyObject, password);
    });
  });
}

function addInitialKey(_addr, cb) {
	console.log(_addr);
	attachToContract(function(err, contract, web3) {
		addInitialKeyTX(web3, contract, _addr, function(err, txHash) {
			if (err) {
				console.log("error: " + err);
				return;
			}
			console.log("Wait tx to add initial key to be mined...");
			getTxCallBack(web3, txHash, function() {
				console.log("Initial key " + _addr + " added to contract");
				cb(web3);
			});
		});

	});
}

function getConfig() {
	var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	return config;
}

function configureWeb3(cb) {
	var config = getConfig();
	var web3;
	if (typeof web3 !== 'undefined') {
	  web3 = new Web3(web3.currentProvider);
	} else {
	  web3 = new Web3(new Web3.providers.HttpProvider(config.Ethereum[config.environment].rpc));
	}
	if(!web3.isConnected()) {
		var err = '{code: 500, title: "Error", message: "check RPC"}';
		cb(err, web3, config);
	} else {
		//console.log(web3.eth.accounts);
		
		web3.eth.defaultAccount = config.Ethereum[config.environment].account;
		var defaultAccount = web3.eth.defaultAccount;
		cb(null, web3, config, defaultAccount);
	}
}

function attachToContract(cb) {
	var config = getConfig();
	configureWeb3(function(err, web3, config, defaultAccount) {
		if (err) {
			console.log(err);
			return;
		}

		var contractABI = config.Ethereum.contracts.Oracles.abi;
		var contractAddress = config.Ethereum[config.environment].contractAddress;

		if(!web3.isConnected()) {
			if (cb) {
					cb({code: 200, title: "Error", message: "check RPC"}, null);
				}
		} else {
			var MyContract = web3.eth.contract(contractABI);

			contract = MyContract.at(contractAddress);
			
			if (cb) {
				cb(null, contract, web3);
			}
		}
	});
}

function toUnifiedLengthLeft(strIn) {//for numbers
  var strOut = "";
  for (var i = 0; i < 64 - strIn.length; i++) {
    strOut += "0"
  }
  strOut += strIn;
  return strOut;
}

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += hex.slice(-4);
    }

    return result
}


function SHA3Encrypt(web3, str, cb) {
  var strEncode = web3.sha3(str);
  cb(strEncode, null);
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function addInitialKeyTX(web3, contract, _addr, cb) {
		if(!web3.isConnected()) {
			cb({code: 500, title: "Error", message: "check RPC"}, null);
		} else {
			var func = "addInitialKey(address)";
			SHA3Encrypt(web3, func, function(funcEncode) {
				var funcEncodePart = funcEncode.substring(0,10);
				var data = funcEncodePart
			    + toUnifiedLengthLeft(_addr.substr(2));

			    var gasWillUsed = web3.eth.estimateGas({from: web3.eth.defaultAccount, to: _addr, data: data});
			    gasWillUsed += 31000;
			    //console.log(gasWillUsed);

			    console.log("new initial key: " + _addr);
			    console.log("from: " +  web3.eth.defaultAccount);

				contract.addInitialKey.sendTransaction(_addr, {gas: gasWillUsed, from: web3.eth.defaultAccount}, function(err, result) {
					cb(err, result);
				});
			});
		}
}

function sendEtherToInitialKeyTX(web3, _addr, cb) {
	if(!web3.isConnected()) {
		cb({code: 500, title: "Error", message: "check RPC"}, null);
	} else {
		var ethToSend = 100000000000000000;
		var gasWillUsed = web3.eth.estimateGas({from: web3.eth.defaultAccount, to: _addr, value: ethToSend});
		web3.eth.sendTransaction({gas: gasWillUsed, from: web3.eth.defaultAccount, to: _addr, value: ethToSend}, function(err, result) {
			cb(err, result);
		});
	}
}
