"use strict";
const chai = require("chai");
const expect = chai.expect;
const co = require('co');

var HumanWorkerTokenFactory = artifacts.require("./HumanWorkerTokenFactory.sol");

var factoryContract;


contract('HumanWorkerTokenFactory', function(accounts) {

    before(function() {
        return co(function*() {
            factoryContract = yield HumanWorkerTokenFactory.deployed();
        });
    });

    it('HumanWorkerTokenFactory is deployed', function(done) {
        var p1 = co(function*() {
            factoryContract = yield HumanWorkerTokenFactory.deployed();
            assert(factoryContract.address !== undefined, "HumanWorkerTokenFactory not deployed");
        });

        p1.then(done());
    });


    it('createHumanWorker() should work', function(done) {
        var workertoken;
        var p1 = co(function*() {
            yield factoryContract.createHumanWorker("<<descriptionOfContract>>");
            workertoken = (yield factoryContract.getContracts())[0];
        });

        var p2 = new Promise(function(resolve, reject) {
            factoryContract.HumanWorkerTokenCreated(function(error, result) {
                if (!error) {
                    // console.log(result);
                    resolve(result);
                } else { reject(error); }
            });
        });

        Promise.all([p1, p2]).then(values => {
            let result = values[1];
            assert(result.args._workToken == workertoken, "workertoken != event workertoken");
            assert(result.args._from == accounts[0], "_from != event _from");
            done();
        });
    });

});