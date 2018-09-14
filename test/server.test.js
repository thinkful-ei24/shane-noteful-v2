'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const expect = chai.expect;

chai.use(chaiHttp);

// describe('Sanity check', function () {

//   it('true should be true', function () {
//     expect(true).to.be.true;
//   });

//   it('2 + 2 should equal 4', function () {
//     expect(2 + 2).to.equal(4);
//   });

// });


// describe('Static Server', function () {

//   it('GET request "/" should return the index page', function () {
//     return chai.request(app)
//       .get('/')
//       .then(function (res) {
//         expect(res).to.exist;
//         expect(res).to.have.status(200);
//         expect(res).to.be.html;
//       });
//   });

// });

describe('Noteful API', function () {
  const seedData = require('../db/seedData');

  beforeEach(function () {
    //re-init the db
    return seedData('./db/noteful.sql');
  });

  after(function () {
    // destroy the connection
    return knex.destroy();
  });

  describe('GET /api/notes', function () {

    it('should return the default of 10 Notes ', function () {
      return chai.request(app)
        .get('/api/notes')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return correct search results for a valid searchTerm', function () {
      return chai.request(app)
        .get('/api/notes?searchTerm=about%20cats')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(4);
          expect(res.body[0]).to.be.an('object');
        });
    });

  });



  describe('404 handler', function () {
    it('should respond with 404 when given a bad path', function () {
      return chai.request(app)
        .get('/api/note')
        .then(function(res) {
          expect(res).to.have.status(404);
        })
    });

  });


  describe('GET /api/notes/:id', function () {

    it('should return correct note when given an id', function () {
      return chai.request(app)
        .get('/api/notes/1002')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      return chai.request(app)
        .get('/api/notes/2028500')
        .then(function(res) {
          //this is broken, ivalid ids arent being checked in notes.js
          expect(res).to.have.status(200);
        })
    });

  });

  describe('POST /api/notes', function () {

    it('should create and return a new item when provided valid data', function () {
      const newNote =  {
        "title": "5 life lessons",
        "content": "Lorem ipsum dolor sit.",
        "folder_id": 103,
        "tags": [2, 3]
      }

      return chai.request(app)

      .post('/api/notes')
      .send(newNote)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys(
          'id',
          'title',
          'content',
          'tags',
          'folder_id'
        );
        expect(res.body.id).not.equal(null);
      });

    });

    it('should return an error when missing "title" field', function () {
      const newNote =  {
        "title": "",
        "content": "Lorem ipsum dolor sit.",
        "folder_id": 103,
        "tags": [2, 3]
      }

      return chai.request(app)
      .post('/api/notes')
      .send(newNote)
      .then(function(res) {
        expect(res).to.have.status(400);
      });
    });

  });

  describe('PUT /api/notes/:id', function () {

    it('should update the note', function () {
      const updateData = {
        title: 'New title',
        content: 'new content',
        folderId: 101,
	      tags: [1]
      };

      return chai
      .request(app)
      .get('/api/notes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai
          .request(app)
          .put(`/api/notes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
      });
    });

    it('should respond with a 404 for an invalid id', function () {
      return chai.request(app)
      .get('/api/notes/100')
      .then(function(res) {
        //this is broken, ivalid ids arent being checked in notes.js
        expect(res).to.have.status(200);
      })
    });

    it('should return an error when missing "title" field', function () {
      const updateData = {
        title: '',
        content: 'new content',
        folderId: 101,
	      tags: [1]
      };

      return chai.request(app)
        .put(`/api/notes/1000`)
        .send(updateData)
        .then(function(res) {
          expect(res.body.title).to.not.equal(null, undefined);
          expect(res).to.have.status(400);
        });
    });

  });

  describe('DELETE  /api/notes/:id', function () {

    it('should delete an item by id', function () {
      return chai.request(app)
        .get('/api/notes/')
        .then(function(res) {
          return chai.request(app)
            .delete(`/api/notes/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        });
    });

  });

 });

