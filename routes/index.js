var express = require('express');
var nforce = require('nforce');
var router = express.Router();

// Login and OAuth bits
var sfuser = process.env.SFUSER;
var sfpass = process.env.SFPASS;
var sfclientid = process.env.SFCLIENTID;
var sfclientsecret = process.env.SFCLIENTSECRET;
var sfloapp = process.env.LOAPP; 
var oauthredirecturi = process.env.REDIRURI;
var sfoauthtoken; // store the token here
var sfaccount; // store the account data here
var sfacctrecords; 


// connect to Salesforce
// 'http://localhost:3000/oauth/_callback'
var org = nforce.createConnection({
  clientId: sfclientid,
  clientSecret: sfclientsecret,
  redirectUri: oauthredirecturi,
  autoRefresh: true,
  mode: 'single',
  onRefresh: function(newOAuth, oldOauth, cb) {
    console.log('onRefresh called');
    cb();
  }
});

org.authenticate({ username: sfuser, password: sfpass }).then(function() {
  console.log('authenticated!');
  console.log('token -> ' + org.getOAuth().access_token);
  sfoauthtoken = org.getOAuth().access_token; 
  //console.log('revoking token');
  //return org.revokeToken({ token: org.getOAuth().access_token });
}).then(function(){
  //console.log('token revoked!');
  console.log('testing query');
  return org.query({ query: 'SELECT Id, Name FROM Account LIMIT 1' });
}).then(function(results){
  console.log('query successful!');
  console.log('records returned: ' + results.records.length);
  console.log('records');
  console.log(results.records);
  sfaccount = results.records[0]; 
  sfacctrecords = results.records; 
}).catch(function(err){
  console.error('failed!');
  console.error(err);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  res.render('index', 
    { title: 'Express', sessionid: sfoauthtoken, 
    demoaccount: sfaccount, 
    appId: sfclientid, loApp: sfloapp, sfacctrecords: sfacctrecords });
});

module.exports = router;
