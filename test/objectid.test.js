// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-connector-mongodb
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

require('./init.js');

var Book, Chapter;
var ds = global.getDataSource();
var ObjectID = ds.connector.getDefaultIdType();
var objectIDLikeString = '7cd2ad46ffc580ba45d3cb1f';

describe('ObjectID', function() {
  before(function() {
    Book = ds.define('Book');
    Chapter = ds.define('Chapter');
    Book.hasMany('chapters');
    Chapter.belongsTo('book');
  });

  it('should cast foreign keys as ObjectID', function(done) {
    Chapter.beforeCreate = function(next, data) {
      data.bookId.should.be.an.instanceOf(ds.ObjectID);
      this.bookId.should.be.an.instanceOf(ds.ObjectID);
      next();
    };

    Book.create(function(err, book) {
      if (err) return done(err);
      Chapter.create({bookId: book.id.toString()}, done);
    });
  });

  it('should convert 24 byte hex string as ObjectID', function() {
    var ObjectID = ds.connector.getDefaultIdType();
    var str = objectIDLikeString;
    ObjectID(str).should.be.an.instanceOf(ds.ObjectID);
  });

  it('should not convert 12 byte string as ObjectID', function() {
    var ObjectID = ds.connector.getDefaultIdType();
    var str = 'line-by-line';
    ObjectID(str).should.be.equal(str);
  });

  it('should keep mongodb ObjectID as is', function() {
    var ObjectID = ds.connector.getDefaultIdType();
    var id = new ds.ObjectID();
    ObjectID(id).should.be.an.instanceOf(ds.ObjectID);
  });

  it('should keep non-string id as it', function() {
    var ObjectID = ds.connector.getDefaultIdType();
    var id = 123;
    ObjectID(id).should.be.equal(123);
  });

  context('strictObjectIDCoercion', function () {
    context('set to false (default)', function () {

      beforeEach(function(done) {
        Book.deleteAll(done);
      });

      it('it should coerce to ObjectID', async function() {
        Book = ds.createModel(
          'book',
          {
            xid: {type: String}
          }
        );
        const book = await Book.create({xid: objectIDLikeString});
        book.xid.should.be.an.instanceOf(ds.ObjectID);
      });
    });

    context('set to true', function () {
      it('should not coerce to ObjectID', async function() {
        Book = ds.createModel(
          'book',
          {
            xid: {type: String}
          },
          {strictObjectIDCoercion: true}
        );
        const book = await Book.create({xid: objectIDLikeString});
        book.xid.should.equal(objectIDLikeString);
      });

      it('if type is set to ObjectID, should coerce to ObjectID', async function() {
        Book = ds.createModel(
          'book',
          {
            xid: {type: String, mongodb: {dataType: ObjectID}}
          },
          {strictObjectIDCoercion: true}
        );
        const book = await Book.create({xid: objectIDLikeString});
        book.xid.should.be.an.instanceOf(ds.ObjectID);
      });

    });

  });

});
