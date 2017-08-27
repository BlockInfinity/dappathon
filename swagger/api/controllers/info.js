'use strict';
var web3 = require("./blockchain/connector.js");
var db = require("./db/mysql.js");
const co = require('co');

var humanWorker = web3.HumanWorkerToken;
var factory = web3.HumanWorkerTokenFactory;

var defaultAccount = web3.eth.accounts[0];
var defaultAccount1 = web3.eth.accounts[1];

var tmptxhashes = [];


var dbContracts = [];
var dbTransfers = [];

module.exports = {

    getAccounts: function(req, res) {
        try {

            res.json(web3.eth.accounts);

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    createHumanWorker: function(req, res) {
        try {

            res.json(web3.eth.accounts);

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    createHumanWorker: function(req, res) {
        try {

            var _description = req.swagger.params.para.value._description || "testdescription";
            var _from = req.swagger.params.para.value.fromAddress || defaultAccount;
            var _ownerName = req.swagger.params.para.value.identity || "Magnus";



            factory.createHumanWorker(_description, { from: _from, gas: 4500000 });




            factory.HumanWorkerTokenCreated(function(err, result) {
                if (tmptxhashes.indexOf(result.transactionHash) > -1) {
                    // console.log("return");
                    return;
                }
                tmptxhashes.push(result.transactionHash)

                if (!err) {
                    var _workToken = result.args._workToken;
                    var _from = result.args._from;

                    dbContracts.push({ tokenAddress: _workToken, tokenName: "HumanWorkerToken", description: _description, ownerName: _ownerName, ownerAddress: _from });

                    // res.json({ contractRegister: _contractRegister, from: _from }));
                    res.json({ workToken: _workToken, from: _from });
                } else { throw err; }
            });

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    getContracts: function(req, res) {
        try {

            res.json(dbContracts);

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    transfer: function(req, res) {
        try {

            var _from = req.swagger.params.para.value.from || defaultAccount;
            var _to = req.swagger.params.para.value.to || defaultAccount1;
            var _volume = req.swagger.params.para.value.volume || 10;

            humanWorker.transfer(_to, _volume, { from: _from });

            humanWorker.Transfer(function(err, result) {
                if (tmptxhashes.indexOf(result.transactionHash) > -1) {
                    // console.log("return");
                    return;
                }
                tmptxhashes.push(result.transactionHash)

                if (!err) {
                    var _to = result.args._to;
                    var _from = result.args._from;
                    var _value = result.args._value;

                    dbTransfers.push({ to: _to, from: _from, value: _value });

                    // res.json({ contractRegister: _contractRegister, from: _from }));
                    res.json({ to: _to, from: _from, value: _value });
                } else { throw err; }
            });

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    getTransfers: function(req, res) {
        try {

            res.json(dbTransfers);

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    getContractsByOwner: function(req, res) {
        try {
            var _owner = req.swagger.params.address.value || defaultAccount;

            let helper = [];
            for (var i in dbContracts) {
                if (dbContracts[i].ownerAddress == _owner) {
                    helper.push(dbContracts[i]);
                }
            }

            res.json(helper);

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },

    getContractByAddress: function(req, res) {
        try {
            var _address = req.swagger.params.address.value || defaultAccount;

            let helper;
            for (var i in dbContracts) {
                if (dbContracts[i].tokenAddress == _address) {
                    helper = dbContracts[i];
                }
            }

            res.json(helper);

        } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
        }
    },



}