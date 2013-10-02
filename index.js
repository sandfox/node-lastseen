
function noop(){}

function timestamp(){
  return Math.floor(Date.now() / 1000)
}

/**
 * For redis bulk replies to turn arrays into objects
 * @param  {Array} replyArray
 * @return {Object}
 */
function mapArrayFields(replyArray){
  var obj = {};
  for(var i = 0, len = replyArray.length; i < len; i+=2) {
    obj[replyArray[i]] = replyArray[i+1]
  }

  return obj;
}

function arrayOuputHandler(callback) {
  return function(err, data){
    if(err) {
      return callback(err);
    }
    return callback(null, mapArrayFields(data))
  }
}

/**
 * Factory thing for Lastseen class
 * 
 * @param  {RedisClient} redisClient
 * @param  {object} options
 * @return {LastSeen}
 */
module.exports = function(redisClient, options){
  return new Lastseen(redisClient, options);
}

/**
 * Init lastseen tracker
 *
 * Options
 *
 * - 'redisKey' redis key to use
 * 
 * @param {RedisClient} redisClient [description]
 * @param {[type]} options     [description]
 */
function Lastseen(redisClient, options) {
  options = options || {};
  this.redisClient = redisClient;
  this.redisKey = options.redisKey || 'online' ;
}

/**
 * Add an ID to lastseen with current timestamp, if id already tracked it will be updated
 * with a new timestamp
 * 
 * @param {int|string|array(int|string)}   id       string or int (or array of those) to be added
 * @param {Function} callback called once confirmed written to redis, args - err, num of records written
 */
Lastseen.prototype.add = function(id, callback) {

  var args = [this.redisKey]; 
  var ts = timestamp();

  if(Array.isArray(id)) {
    id.forEach(function(el){
      args.push(ts, el)
    })
  } else {
    args.push(ts, id)
  }

  args.push(callback || noop)

  this.redisClient.zadd.apply(this.redisClient, args)
};

/**
 * find a given id and if exists the timestamp of when was added 
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 * @return {Boolean}           [description]
 */
Lastseen.prototype.find = function(id, callback) {
  this.redisClient.zscore(this.redisKey, id, callback)
};

/**
 * retrieve all keys ordered by most recent seen first
 *
 * Options
 *
 * - 'limit' [int] total number of keys to return (default - ALL THE KEYS)
 * - 'offset' [int] offset to start from (default - the beginning)
 * - 'withScores' [bool] if to include timestamps, default false
 * 
 * @param  {Object}   opts
 * @param  {Function} callback args(err, [Object|array]) if 'withScore' is true Object, else array
 */
Lastseen.prototype.all = function(opts, callback) {

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var args = [this.redisKey, opts.offset || 0 , opts.limit || -1]

  if (opts.withScores) {
    args.push('WITHSCORES')
    callback = arrayOuputHandler(callback);
  }

  this.redisClient.zrevrange(args, callback)
}

/**
 * Clear all activity tracking
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Lastseen.prototype.clear = function(callback) {
  this.redisClient.del(this.redisKey, (callback || noop))
}

/**
 * fetch all ids seen since a timestamp (i.e heading towards the present)
 *
 * Options
 *
 * - 'limit' [int] total number of keys to return (default - ALL THE KEYS)
 * - 'offset' [int] offset to start from (default - the beginning) - why do we even support this?
 * - 'withScores' [bool] if to include timestamps, default false
 * 
 * @param  {[type]}   timestamp [description]
 * @param  {[type]}   opts      [description]
 * @param  {Function} callback  [description]
 */
Lastseen.prototype.since = function(timestamp, opts, callback) {

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  this.between('+inf', timestamp, opts, callback)

};

/**
 * fetch all ids seen before a timestamp (i.e heading into the past)
 *
 * Options
 *
 * - 'limit' [int] total number of keys to return (default - ALL THE KEYS)
 * - 'offset' [int] offset to start from (default - the beginning)
 * - 'withScores' [bool] if to include timestamps, default false
 * 
 * @param  {[type]}   timestamp [description]
 * @param  {[type]}   opts      [description]
 * @param  {Function} callback  [description]
 */
Lastseen.prototype.before = function(timestamp, opts, callback) {

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  this.between(timestamp, '-inf', opts, callback)
};

/**
 * Really just an internal function
 *
 * Options
 *
 * - 'limit' [int] total number of keys to return (default - ALL THE KEYS)
 * - 'offset' [int] offset to start from (default - the beginning) why do we even support this?
 * - 'withScores' [bool] if to include timestamps, default false
 * 
 * @param  {int|string}   start    [description]
 * @param  {int|string}   end      [description]
 * @param  {Object}   opts     [description]
 * @param  {Function} callback [description]
 */
Lastseen.prototype.between = function(start, end, opts, callback) {


  var args = [this.redisKey, start, end, 'WITHSCORES']

  if(opts.withScore) {
    args.push('WITHSCORES');
    callback = arrayOuputHandler(callback);
  }

  if (opts.limit) {
    args.push('LIMIT', opts.offset || 0, limit)
  }

  this.redisClient.zrevrangebyscore(args, callback)

};
