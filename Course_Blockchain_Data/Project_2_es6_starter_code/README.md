# Project #2. Private Blockchain

This is Project 2, Private Blockchain, in this project I created the classes to manage my private blockchain, to be able to persist my blochchain I used LevelDB and to post and get blocks using Node.js framework Express.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node app.js__ in the root directory.

## Blockchain API

## POST Request Validation Endpoint

http://localhost:8000/requestValidation

with body:
{ 
	"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" 
}

## POST Message Signature

http://localhost:8000/message-signature/validate

with body:
{
	"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
	"signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}

##GET Block Endpoint

http://localhost:8000/block/[blockheight]

Example URL path:
http://localhost:8000/block/0, where '0' is the block height.

## GET Block by Hash Endpoint

http://localhost:8000/stars/hash:[hash]

Example URL path:
http://localhost:8000/stars/hash:32d161bb3483da5a6331e5b8304541ab3610eed4405a28692cc751b30d598da6

## GET Block by Address Endpoint

http://localhost:8000/stars/address:[address]

Example URL path:
http://localhost:8000/stars/address:19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL

##POST Block Endpoint

http://localhost:8000/block

with body:
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}


## What do I learned with this Project

* I was able to identify the basic data model for a Blockchain application.
* I was able to use LevelDB to persist the Blockchain data.
* I was able to write algorithms for basic operations in the Blockchain.
* I was able to create API for my private blockchain
