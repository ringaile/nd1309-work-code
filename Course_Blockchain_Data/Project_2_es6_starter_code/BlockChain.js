/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain      |
|  ================================================ */

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class BlockChain {
  constructor (app) {
    this.app = app;
    this.bd = new LevelSandbox.LevelSandbox();
    this.generateGenesisBlock();
    this.getBlockByIndex();
    this.postNewBlock();
  }

  /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
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
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/api/block", (req, res) => {
            let blockTest = new Block.Block("Test Block - ");
            this.addBlock(blockTest).then((result) => {
              console.log(result);
              res.send("Got a Post request!");
            }).catch((err) => { 
              console.log(err);
              res.send("There was a error creating a block.");
            });            
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
