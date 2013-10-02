# lastseen

Track when users/things were last seen using redis.

_This library is pretty experimental right now but does actually work, I'm just not sure how much of a good idea it is_


## CAUTION - HERE LIE DRAGONS FOR THE UNWARY

Unlike some other  "who is online" libraries which you might come across,  this library does _not_ expire keys (it can't because of Redis' current design) and is therefore unbounded in terms of memory  consumption. If you keep on tracking new ids you will eventually run out of RAM.

This is completely by design, it's meant to track things for very long periods of time.



## Installation

```
$ npm install online
```

## Example

```js
var Lastseen = require('lastseen');
var redis = require('redis');
var client = redis.createClient()

var opts = {
  redisKey: 'online' //name for redis key for set
}

var lastseen = Lastseen(client, opts);


lastseen.add(someId, function(err){
  //optional callback fired when written to redis
})

//Check if a user is known about
lastseen.find(someId, function(err, result){
  //err if redis failure
  //result is null for not known, or last seen timestamp for user
})

```


## Usage

For now read the docblocks in `index.js`

## TODO

__EVERYTHING__

PRs, issues bugs, comments and general derision are welcome

+ moar tests, the current tests folder has alot of left over stuff from previous APIs
+ functions to remove ranges (remove old entries by number/time)_maybe expensive_
+ some kind of benchmarking to see what it's any good at
