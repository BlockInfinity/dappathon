var HumanWorkerToken = artifacts.require("./HumanWorkerToken.sol");
var HumanWorkerTokenFactory = artifacts.require("./HumanWorkerTokenFactory.sol");
var fs = require('fs');
var path = require('path');

module.exports = function(deployer) {

    var p1 = deployer.deploy(HumanWorkerToken);
    var p2 = deployer.deploy(HumanWorkerTokenFactory);


    Promise.all([p1, p2]).then(function() {

        var p3 = HumanWorkerToken.deployed();
        var p4 = HumanWorkerTokenFactory.deployed();

        Promise.all([p3, p4]).then(values => {
            console.log(values[0].address); // [3, 1337, "foo"]
            var obj = { "HumanWorkerToken": values[0].address, "HumanWorkerTokenFactory": values[1].address };
            var jsonPath = path.join(__dirname, '..', '/contracts/addresses.json');
            fs.writeFile(jsonPath, JSON.stringify(obj), function(err) {
                if (err) {
                    return console.log(err);
                }
            });
        });
    });
};


