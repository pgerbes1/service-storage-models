'use strict';

const mongoose = require('mongoose');

/**
 * Represents the history of storage related summary 
 * statistics for buckets and their associated files
 * @constructor
 */

var StorageStatistic = new mongoose.Schema({
  bucket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bucket',
    required: true
  },
  bucketEntry: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'BucketEntry',
  	required: true
  },
  user: {
  	type: String, 
  	ref: 'User',
  	required: true
  },
  timestamp: {
  	type: Date,
  	required: true
  },
  uploadBandwidth: {
    type: Number, 
    required: false
  },
  downloadBandwidth: {
  	type: Number,
  	required: false
  },
  storage: {
  	type: Number, 
  	required: false
  }
});

StorageStatistics.index({ bucket: 1 });
StorageStatistics.index({ bucketEntry: 1});

module.exports = function(connection) {
  return connection.model('StorageStatistic', StorageStatistic);
};