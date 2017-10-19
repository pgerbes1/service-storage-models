'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
const SchemaOptions = require('../options');
const elliptic = require('elliptic');
const ecdsa = new elliptic.ec(elliptic.curves.secp256k1);
const utils = require('../utils');

/**
 * Represents a public key
 * @constructor
 */
var PublicKey = new mongoose.Schema({
  _id: { // key
    type: String,
    required: true
  },
  user: {
    type: String,
    ref: 'User',
    validate: {
      validator: function(v) {
        return utils.isValidEmail(v);
      },
      message: 'Invalid user email address'
    },
  },
  label: {
    type: String
  }
});

PublicKey.index({user: 1});

PublicKey.plugin(SchemaOptions, {
  read: 'secondaryPreferred'
});

PublicKey.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret._id;
  }
});

PublicKey.virtual('key').get(function() {
  return this._id;
});

/**
 * Creates a public key
 * @param {storage.models.User} user
 * @param {String} pubkey
 * @param {Function} callback
 */
PublicKey.statics.create = function(user, pubkey, label, callback) {
  let PublicKey = this, kp;

  if (typeof label === 'function') {
    callback = label;
  }

  try {
    kp = PublicKey.validate(pubkey);
  } catch (err) {
    return callback(new Error('Invalid public key supplied: ' + err.message));
  }

  let publicKey = new PublicKey({
    user: user._id,
    _id: pubkey,
    label: typeof label === 'string' ? label : ''
  });

  PublicKey.findOne({ _id: pubkey }, function(err, pubkey) {
    if (pubkey) {
      return callback(new Error('Public key is already registered'));
    }

    publicKey.save(function(err) {
      if (err) {
        return callback(err);
      }

      callback(null, publicKey);
    });
  });
};

/**
 * Validates a public key
 * @param {String} pubkey
 * @returns {Object}
 */
PublicKey.statics.validate = function(pubkey) {
  assert(
    pubkey.length === pubkey.split(':').join('').length,
    'Must not contain non-hexidecimal characters like ":"'
  );

  pubkey = Buffer(pubkey, 'hex').toString('hex');
  pubkey = ecdsa.keyFromPublic(pubkey, 'hex');

  assert.ok(pubkey.pub, 'Invalid public key supplied');

  return pubkey;
};

module.exports = function(connection) {
  return connection.model('PublicKey', PublicKey);
};
