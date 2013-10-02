var test = require('tape');
var async = require('async');
var redis = require('fakeredis')
var LastSeen = require('../')

test('single id add', function(t){

  t.plan(2);

  var client = redis.createClient();
  var lastSeen = LastSeen(client);

  lastSeen.add('bobby', function(err, res){
    t.error(err);
    t.equal(1, res)
  });
})

test('single id add and find', function(t){
  t.plan(4);

  var client = redis.createClient();
  var lastSeen = LastSeen(client);

  var user = 'rocky'
  var ts = Math.floor(Date.now() / 1000);

  async.series({
    add: function(cb){
      lastSeen.add(user, function(err, res){
        t.error(err);
        t.equal(1, res);
        cb()
      });
    },
    find: function(cb) {
      lastSeen.find(user, function(err, res){
        t.error(err);
        t.equal(ts, res);
        cb()        
      })
    }
  })
})
