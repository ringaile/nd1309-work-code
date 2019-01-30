/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain      |
|  ================================================ */

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const TimeoutRequestsWindowTime = 5*60*1000;

class BlockChain {
  constructor (app) {
    this.app = app;
    this.bd = new LevelSandbox.LevelSandbox();
    this.requests = [];
    this.registeredStars = [];
    this.generateGenesisBlock();
    this.getBlockByHash();
    this.getBlockByIndex();
    this.postNewBlock();
    this.getBlockByAddress();
    this.postRequestValidation();
    this.postMessageValidation();
  }

    /**
     * Implement a POST Endpoint to request validation, url: "/api/requestValidation"
     */
    postRequestValidation() {
        this.app.post("/api/requestValidation", (req, res) => {

          if(this.requests.length == 0) {
            //adding new request
            var timeStamp = new Date().getTime().toString().slice(0, -3);

            var data = {
              address: req.body.address,
              requestTimeStamp: timeStamp,
              message : req.body.address + ":" + timeStamp + ":starRegistry",
              validationWindow : TimeoutRequestsWindowTime
            };
            this.requests.push(data);
            res.send(data);              
          } else {
            //checking if the request already exsists 
            for (var i=0; i<this.requests.length; i++) {
              if (this.requests[i].address == req.body.address) {
                //check if no timeout
                var currentTime = new Date().getTime().toString().slice(0, -3);
                var difference = currentTime - this.requests[i].requestTimeStamp;
                if( difference < TimeoutRequestsWindowTime) {
                  this.requests[i].validationWindow = TimeoutRequestsWindowTime - difference;
                  res.send(this.requests[i]);
                } else {
                  //delete old request and add new
                  this.requests.splice(i, 1);
                  var timeStamp = new Date().getTime().toString().slice(0, -3);

                  var data = {
                    address: req.body.address,
                    requestTimeStamp: timeStamp,
                    message : req.body.address + ":" + timeStamp + ":starRegistry",
                    validationWindow : TimeoutRequestsWindowTime
                  };
                  this.requests.push(data);
                  res.send(data);
                }
                }
            }
          }
               
        });
    }

        /**
     * Implement a POST Endpoint to validate message, url: "/api/message-signature/validate"
     */
    postMessageValidation() {
        this.app.post("/api/message-signature/validate", (req, res) => {

          for (var i=0; i<this.requests.length; i++) {
            //check if the request exsits
            if (this.requests[i].address == req.body.address) {
                // check if no timeout
                var currentTime = new Date().getTime().toString().slice(0, -3);
                var difference = currentTime - this.requests[i].requestTimeStamp;
                if( difference < TimeoutRequestsWindowTime) {
                  let isValid = bitcoinMessage.verify(this.requests[i].message, req.body.address, req.body.signature);
                  var status = {
                    address: req.body.address,
                    requestTimeStamp: currentTime,
                    message : this.requests[i].message,
                    validationWindow : TimeoutRequestsWindowTime - difference,
                    messageSignature : isValid 
                  };

                  var data = {
                    registerStar : isValid ,
                    status : status
                  };
                    res.send(data);  
                }
            }
          } 
          res.send("No Request found!");    
        });
    }

  /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "api/stars/hash:[HASH]"
     */
    getBlockByHash() {
        this.app.get("/api/stars/hash::hash", (req, res) => {
            // Add your code here
            this.getDBBlockByHash(req.params.hash).then((block) => {
              res.send(block);
            }).catch((err) => { 
              console.log(err);
              res.send("There was a error with getting a block.");
            });
        });
    }

      /**
     * Implement a GET Endpoint to retrieve a block by address, url: "api/stars/address:[ADDRESS]"
     */
    getBlockByAddress() {
        this.app.get("/api/stars/address::address", (req, res) => {
            // Add your code here
            this.getDBBlockByAddress(req.params.address).then((block) => {
              res.send(block);
            }).catch((err) => { 
              console.log(err);
              res.send("There was a error with getting a block.");
            });
        });
    }

      /**
     * Implement a GET Endpoint to retrieve a star by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/api/block/:index", (req, res) => {
            // Add your code here
            this.getBlock(req.params.index).then((block) => {
              console.log(JSON.stringify(block));
              res.send(block);
            }).catch((err) => { 
              console.log(err);
              res.send("There was a error with getting a block.");
            });

        });
    }

        /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block" only if user has signed already
     */
    postNewBlock() {
        this.app.post("/api/block", (req, res) => {

          for (var i=0; i<this.registeredStars.length; i++){
            //check if the star is regsitered and valid
            if((this.registeredStars[i].status.address == req.body.address) && (this.registeredStars[i].registerStar == true)){
              if(!req.body){
                res.send("Cannot create Block: String is empty.");
              } else {
                let blockTest = new Block.Block(req.body);
                this.addBlock(blockTest).then((result) => {
                console.log(result);
                res.send("Got a Post request!");
                }).catch((err) => { 
                  console.log(err);
                  res.send("There was a error creating a block.");
                }); 
              }           
            } else {
              res.send("You must sign the message before.");
            }
          }          
      });
    }

// Helper method to create a Genesis Block (always with height= 0)
// You have to options, because the method will always execute when you create your blockchain
// you will need to set this up statically or instead you can verify if the height !== 0 then you
// will not create the genesis block
async generateGenesisBlock () {
    // Add your code here
    const genesisBlock = new Block.Block('First block in the chain - Genesis block');
    genesisBlock.time = new Date().getTime().toString().slice(0, -3);
    genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
    this.bd.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock).toString());
}

// Get block height, it is a helper method that return the height of the blockchain
async getBlockHeight () {
    // Add your code here
    return await this.bd.getBlocksCount() - 1;
}

// Add new block
async addBlock (newBlock) {
    // Add your code here
    const height = await this.getBlockHeight();
    newBlock.height = height + 1;
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    const previousBlock = await this.getBlock(height)
    newBlock.previousBlockHash = previousBlock.hash
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    return this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
}

// Get Block By Height
async getBlock (height) {
    // Add your code here
    return JSON.parse(await this.bd.getLevelDBData(height))
  }

// Get block by Hash
  async getDBBlockByHash(hash) {
    return await this.bd.getLevelDBDataByHash(hash)
  }

  // Get block by Hash
  async getDBBlockByAddress(address) {
    return await this.bd.getLevelDBDataByAddress(address)
  }


// Validate if Block is being tampered by Block Height
async validateBlock (height) {
    // Add your code here
    const block = await this.getBlock(height);
    const blockHash = block.hash;
    block.hash = '';
    const validBlockHash = SHA256(JSON.stringify(block)).toString();
    if (validBlockHash === blockHash) {
      return true;
    } else {
      return false;
    };
}

// Validate Blockchain
async validateChain () {
    // Add your code here
    const height = await this.getBlockHeight();
    const checkedBlocks = [];
    checkedBlocks.push(await this.validateBlock(0));
    for (let i = 1; i < height + 1; i++) {
      checkedBlocks.push(await this.validateBlock(i));
    }
    return Promise.all(checkedBlocks).then(validatedBlocks => {
      return !validatedBlocks.toString().includes(false);
    });
}

// Utility Method to Tamper a Block for Test Validation
// This method is for testing purpose
_modifyBlock (height, block) {
    let self = this
    return new Promise((resolve, reject) => {
      self.bd.addLevelDBData(height, JSON.stringify(block).toString())
        .then(blockModified => {
          resolve(blockModified)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }
}

module.exports = (app) => { return new BlockChain(app);}
