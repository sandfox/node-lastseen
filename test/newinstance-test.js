var test = require('tape');
var async = require('async');
var redis = require('fakeredis')
var LastSeen = require('../')


test('creating new instance', function(t){

  t.plan(1);
  var client = redis.createClient()
  t.doesNotThrow(function(){
    var lastSeen = LastSeen(client);
  })

})


