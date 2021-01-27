const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://logindb:27017';
const dbName = 'logindb';
const collectionName = 'documents';


function writeLogin2db(username) {
  callClientPromise().then(client => {
    console.log("WriteLogin2db: client connected");
    const query = {login: username}
    const db = client.db(dbName);
    callUserPromise(username)
      .then (user=>{
        console.log("user in writeLogin2db: "+ user);
        if (user == null){
          entry = {login: username, admin: false}
          upsertEntry(db, collectionName, entry, function(){
            console.log("WriteLogin2db: Close Connection");
            client.close();
          });
        } else client.close();
      });
    });
}

function removeLoginFromdb(username){
  callClientPromise().then(client => {
    console.log("RemoveLoginFromdb: client connected");
    const query = {login: username}
    const db = client.db(dbName);
    callUserPromise(username)
      .then (user=>{
        console.log("user in removeLogiFromdb: "+ user);
        if (user){
          entry = {login: username, admin: false}
          removeEntry(db, collectionName, entry, function(){
            console.log("RemoveLoginFromdb: Close Connection");
            client.close();
          });
        } else client.close();
      });
    });
}

const clientPromise = () =>{
  return new Promise((resolve, reject) =>{
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: false}, function(err, client){
      err ?
        reject(err) : resolve(client);
  });
  });
}

const callClientPromise = async() =>{
  const client = await(clientPromise());
  return client;
}


 
const userPromise = (username) =>{
  return new Promise((resolve, reject) => {
    callClientPromise().then(client => {
      const query = {login: username}
      const db = client.db(dbName);
      const entryPromise = () => {
        return new Promise((resolve, reject)=>{
          db
            .collection(collectionName)
            .findOne(query, function (err, doc){
              err ?
              reject(err) : resolve(doc);
            
            });
        });
      }
    
      const callEntryPromise = async () =>{
        const user = await(entryPromise());
        console.log("CallEntrPromise (user): "+ user);
        return user;
      };
      callEntryPromise().then(function(user){
        client.close();
        resolve(user);
      });
    });
  })
}

async function callUserPromise(username) {
  const user = await(userPromise(username));
  return user;
}


const findEntry = async function(db, collection, query, callback){
  db.collection(collection).findOne(query, function (err, doc){
    if(err){
      callback(err);
    }
    else {
      callback(null, doc);
    }
  }); 
}

const upsertEntry = function(db, collection, entry, callback){
  db.collection(collection).updateOne(entry, {$set: entry}, {upsert:true}, function(err, result) {
    assert.equal(null, err);
    assert.equal(1, JSON.parse(result)["ok"]);
    console.log('err: ' + err);
    //console.log('result:' + result);
    console.log('result.ok:' + JSON.parse(result)["ok"]);
    
    console.log('Entry upserted');
    console.log(entry);
    callback(result);
  });
}
const removeEntry = function(db, collection, entry, callback){
  db.collection(collection).deleteOne(entry, function(err, result) {
    assert.equal(null, err);
    console.log('err: ' + err);
    console.log('Entry delteted: ' + result);
    callback(result);
  });
}







exports.writeLogin2db = writeLogin2db;
exports.removeLoginFromdb = removeLoginFromdb;
exports.callUserPromise = callUserPromise;
