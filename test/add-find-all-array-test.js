var test = require('tape');
var async = require('async');
var redis = require('redis')
var LastSeen = require('../')


test('array id add', function(t){

  t.plan(2);

  var client = redis.createClient();
  var lastSeen = LastSeen(client);

  lastSeen.add(['bob', 'anna', 'sophie'], function(err, res){
    t.error(err);
    t.equal(res, 3)
  });
})

test('array id add, find and all', function(t){
  t.plan(10);

  var client = redis.createClient();
  var lastSeen = LastSeen(client);

  var users = ['rocky', 'stoney', 'earthy', '2034'];
  var ts = Math.floor(Date.now() / 1000)+"";

  async.series({
    add: function(cb){
      lastSeen.add(users, function(err, res){
        t.error(err);
        t.equal(res, users.length);
        cb()
      });
    },
    find: function(cb){
      lastSeen.find(users[1], function(err, res){
        t.error(err);
        t.equal(res, ts);
        cb()        
      })
    },
    allWithScore: function(cb) {
      var opts = {
        withScores : true
      }
      lastSeen.all(opts, function(err, res){
        t.error(err);
        t.equal(Object.keys(res).length, users.length)
        users.forEach(function(user){
          t.equal(res[user], ts)
        })
        cb()        
      })
    }
  })
})
