var crypto = require('crypto');
var apn = require('apn');
var mysql = require('mysql');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var ffmpeg = require('fluent-ffmpeg');

// Config
var profilespath = './public/profiles/';
var privatepath = './private/';
var serveraddress = 'http://www.tripino.net:3000/';

// APN Connection
var apnConnection = new apn.Connection({
  "cert": "aps_cert.pem",
  "key": "aps_key.pem",
  "production": true,
  "batchFeedback": true,
  "interval": 300,
  "maxConnections": 5
});

var apnDeveloper = new apn.Connection({
  "cert": "aps_developer_cert.pem",
  "key": "aps_developer_key.pem",
  "production": false,
  "batchFeedback": true,
  "interval": 300,
  "maxConnections": 5
});

var serveraddress = 'http://www.tripino.net:3000/';
mongoose.connect('mongodb://localhost/tripinoMongo');
var Schema = mongoose.Schema;

// MySQL Config
var connection;
var mysql_config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '01411rou',
  database: 'tripino'
};

// Define MongoDB tables
var noteSchema_config = {
  userid: String,
  publicState: Number,
  fileName: String,
  text: String,
  impressed: [String],
  commentNum: Number
};

var thumbSchema_config = {
  userid: String,
  fileName: String,
  fileData: Buffer,
  thumbType: Number,
  thumbIndex: Number,
  impressed: [String],
  commentNum: Number
};

var imageSchema_config = {
  userid: String,
  publicState: Number,
  fileName: String,
  fileData: Buffer,
  impressed: [String],
  commentNum: Number
};

var movieSchema_config = {
  userid: String,
  encode: Boolean,
  publicState: Number,
  fileName: String,
  fileData: Buffer,
  streaming: Boolean,
  impressed: [String],
  commentNum: Number
};

var streamingSchema_config = {
  userid: String,
  index: Number,
  segmentIdx: Number,
  segmentData: Buffer
};

var recordSchema_config = {
  userid: String,
  publicState: Number,
  fileName: String,
  fileData: Buffer,
  impressed: [String],
  commentNum: Number
};

var triptorySchema_config = {
  userid: String,
  title: String,
  regDate: Number,
  from: Number,
  to: Number,
  summary: String,
  xmlName: String,
  xml: Buffer,
  data: [Schema.Types.Mixed],
  readCount: Number,
  impressed: [String],
  commentNum: Number
};

var commentSchema_config = {
  tripUser: String,
  tripType: Number,
  tripIdx: Number,
  userid: String,
  comment: String,
  regDate: Number,
  impressed: [String]
};

var bestTripSchema_config = {
  userid: String,
  index: Number,
  title: String,
  regDate: Number,
  summary: String,
  bestDate: Number
};

var apsnSchema_config = {
  userid: String,
  token: String
};

/**
 * Initializes SQL tables. Throws an error if SQL connection has an error.
 */
function handleDisconnect() {
  connection = mysql.createConnection(mysql_config);

  connection.connect(function(err) {
    if (err) {
      console.error('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      var select = connection.query('CREATE TABLE IF NOT EXISTS users (_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,userid VARCHAR(100),password VARCHAR(100),email VARCHAR(100),pictureindex INT,picturepath VARCHAR(255),nickname VARCHAR(100),birth DOUBLE,gender TINYINT) DEFAULT CHARSET=utf8;', function(err, result) {
        if (err) {
          console.error(err);
          throw err;
        }
      });

      // relation 1:ask and unseen, 2:ask and seen, 3:friend
      select = connection.query('CREATE TABLE IF NOT EXISTS relationship (userid1 VARCHAR(100),userid2 VARCHAR(100),relation INT);', function(err, result) {
        if (err) {
          console.error(err);
          throw err;
        }
      });

      select = connection.query('CREATE TABLE IF NOT EXISTS follow (userid1 VARCHAR(100),userid2 VARCHAR(100));', function(err, result) {
        if (err) {
          console.error(err);
          throw err;
        }
      });

      select = connection.query('CREATE TABLE IF NOT EXISTS admin (userid VARCHAR(100)) DEFAULT CHARSET=utf8;', function(err, result) {
        if (err) {
          console.error(err);
          throw err;
        }
      });
    }
  });

  connection.on('error', function(err) {
    console.error('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

/**
 * Initializes MongoDB tables.
 */
var mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function callback() {
  // if connection open succeeds print out the following in the console
  console.log("open: success");
});
autoIncrement.initialize(mongodb);

var noteSchema = new Schema(noteSchema_config);
noteSchema.plugin(autoIncrement.plugin, 'noteData');
var noteData = mongoose.model('noteData', noteSchema);

var thumbSchema = new Schema(thumbSchema_config);
var thumbData = mongoose.model('thumbData', thumbSchema);

var imageSchema = new Schema(imageSchema_config);
imageSchema.plugin(autoIncrement.plugin, 'imageData');
var imageData = mongoose.model('imageData', imageSchema);

var movieSchema = new Schema(movieSchema_config);
movieSchema.plugin(autoIncrement.plugin, 'movieData');
var movieData = mongoose.model('movieData', movieSchema);

var streamingSchema = new Schema(streamingSchema_config);
var streamingData = mongoose.model('streamingData', streamingSchema);

var recordSchema = new Schema(recordSchema_config);
recordSchema.plugin(autoIncrement.plugin, 'recordData');
var recordData = mongoose.model('recordData', recordSchema);

var triptorySchema = mongoose.Schema(triptorySchema_config);
triptorySchema.plugin(autoIncrement.plugin, 'triptoryData');
var triptoryData = mongoose.model('triptoryData', triptorySchema);

var commentSchema = mongoose.Schema(commentSchema_config);
commentSchema.plugin(autoIncrement.plugin, 'commentData');
var commentData = mongoose.model('commentData', commentSchema);

var bestTripSchema = mongoose.Schema(bestTripSchema_config);
bestTripSchema.plugin(autoIncrement.plugin, 'bestTripData');
var bestTripData = mongoose.model('bestTripData', bestTripSchema);

var apsnSchema = mongoose.Schema(apsnSchema_config);
var apsnData = mongoose.model('apsnData', apsnSchema);


module.exports = {
  profilespath: profilespath,
  privatepath: privatepath,
  serveraddress: serveraddress,
  connection: connection,
  handleDisconnect: handleDisconnect,
  noteData: noteData,
  thumbData: thumbData,
  imageData: imageData,
  movieData: movieData,
  streamingData: streamingData,
  recordData: recordData,
  triptoryData: triptoryData,
  commentData: commentData,
  bestTripData: bestTripData,
  apsnData: apsnData,
  apnConnection: apnConnection,
  apnDeveloper: apnDeveloper
};
