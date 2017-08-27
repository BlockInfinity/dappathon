"use strict";
const chai = require("chai");
const expect = chai.expect;
const co = require('co');

var HumanWorkerToken = artifacts.require("./HumanWorkerToken.sol");

var workerToken;


contract('HumanWorkerToken', function(accounts) {

    before(function() {
        return co(function*() {
            workerToken = yield HumanWorkerToken.deployed();
        });
    });

    it('HumanWorkerToken is deployed', function(done) {
        var p1 = co(function*() {
            workerToken = yield HumanWorkerToken.deployed();
            assert(workerToken.address !== undefined, "HumanWorkerToken not deployed");
        });

        p1.then(done());
    });



    it('HumanWorkerToken parameters should be set', function() {
        return co(function*() {
            var _description = yield workerToken.description()
            assert(_description == "testdescription");
            var _sender = yield workerToken.owner();
            assert(_sender == accounts[0]);
        });

    });

    // it('This is how you handle events', function(done) {
    //     var p1 = co(function*() {
    //         yield workerToken.doSomething();
    //     });

    //     var p2 = new Promise(function(resolve, reject) {
    //         workerToken.SomethingHappenedEvent(function(error, result) {
    //             if (!error) {
    //                 // console.log(result);
    //                 resolve(result);
    //             } else { reject(error); }
    //         });
    //     });

    //     Promise.all([p1, p2]).then(values => {
    //         let result = values[1];
    //         assert(result.args.something == something, "something != event something");
    //         done();
    //     });

    // });

});