'use strict';

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server';

chai.should();
chai.use(chaiHttp);

/**
 *   Monitoring endpoint for load balancers
 */

describe('GET /info', () => {
  it('it should respond with a 200', done => {
    chai.request(server)
      .get('/info')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('date');
        done();
      });
  });
});

describe('GET /unknown-route', () => {
  it('it should respond with a 404', done => {
    chai.request(server)
      .get('/unknown-route')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

describe('/api/v1/hello', () => {
  /**
   *  GET test
   */
  describe('GET /api/v1/hello', () => {
    it('it should get a nice hello', done => {
      chai.request(server)
        .get('/api/v1/hello')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.eql({msg: 'Hello World!'});
          done();
        });
    });
  });

  /**
   * POST, PUT, DELETE should 404
   */
  describe('PUT /api/v1/hello', () => {
    it('it should return a 404', done => {
      chai.request(server)
        .put('/api/v1/hello')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('POST /api/v1/hello', () => {
    it('it should return a 404', done => {
      chai.request(server)
        .post('/api/v1/hello')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('DELETE /api/v1/hello', () => {
    it('it should return a 404', done => {
      chai.request(server)
        .delete('/api/v1/hello')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
