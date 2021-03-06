'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');

require('mongoose-types').loadTypes(mongoose);

const ContactSchema = require('../lib/models/contact');
const FarmerProfileSchema = require('../lib/models/farmer-profile');

var Contact;
var FarmerProfile;
var connection;

before(function(done) {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    function() {
      Contact = ContactSchema(connection);
      FarmerProfile = FarmerProfileSchema(connection);
      done();
    }
  );
});

after(function(done) {
  FarmerProfile.remove({}, function() {
    Contact.remove({}, function() {
      connection.close(done);
    });
  });
});

describe('Storage/models/Farmer-Profile', function() {

  it('should create a farmer profile when contact exists', function(done) {
    var contactNodeId = mongoose.Types.ObjectId();

    Contact.record({
      address: '127.0.0.1',
      port: 1337,
      nodeID: contactNodeId,
      lastSeen: Date.now()
    }, function(err) {
      expect(err).to.not.be.an.instanceOf(Error);
    });

    var farmerProfileWithContact = new FarmerProfile({
      farmer: contactNodeId,
      contractCount: 100,
      contractSize: 1000000000,
      downloadedBytes: 500000,
      totalAmountSjcxPaid: 250.50,
      failureRate: 0.5
    });

    /* jshint maxlen: 90 */
    farmerProfileWithContact.save(function(err, farmerProfile) {
      expect(err).to.not.be.an.instanceOf(Error);
      expect(farmerProfile.created).to.be.an.instanceOf(Date);
      expect(farmerProfile.farmer).to.be.an.instanceOf(mongoose.Types.ObjectId);
      expect(farmerProfile.contractCount).to.be.a('number');
      expect(farmerProfile.contractSize).to.be.a('number');
      expect(farmerProfile.downloadedBytes).to.be.a('number');
      expect(farmerProfile.totalAmountSjcxPaid).to.be.a('number');
      expect(farmerProfile.failureRate).to.be.a('number');
      done();
    });
  });
});
