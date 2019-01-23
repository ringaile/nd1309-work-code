# Project #2. Private Blockchain

This is Project 2, Private Blockchain, in this project I created the classes to manage my private blockchain, to be able to persist my blochchain I used LevelDB and to post and get blocks using Node.js framework Express.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node app.js__ in the root directory.

## Blockchain API

##GET Block Endpoint

http://localhost:8000/block/[blockheight]

Example URL path:
http://localhost:8000/block/0, where '0' is the block height.

##POST Block Endpoint

http://localhost:8000/block

with body:
{
      "body": "Your String goes here."
}


## What do I learned with this Project

* I was able to identify the basic data model for a Blockchain application.
* I was able to use LevelDB to persist the Blockchain data.
* I was able to write algorithms for basic operations in the Blockchain.
* I was able to create API for my private blockchain
