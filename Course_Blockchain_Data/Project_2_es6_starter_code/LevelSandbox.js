/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject() 
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let block_count = 0
        return new Promise(function (resolve, reject) {
            self.db.createReadStream()
                .on('data', function (data) {
                    block_count++;
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    resolve(block_count);
                });
        });
    }
        

}

module.exports.LevelSandbox = LevelSandbox;
