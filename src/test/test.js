'use strict';

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server';

chai.should();
chai.use(chaiHttp);

describe('/api/v1/hello', () => {
  /**
   *  Test the route
   */
  describe('GET /api/v1/hello', () => {
    it('it should get a nice hello', (done) => {
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

});
