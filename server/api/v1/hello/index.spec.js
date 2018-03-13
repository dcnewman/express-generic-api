'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var helloCtrlStub = {
  helloWorld: 'helloCtrl.helloWorld'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var helloIndex = proxyquire('./index', {
  'express': {
    Router() {
      return routerStub;
    }
  },
  './hello.controller': helloCtrlStub
});

describe('Hello API router:', function() {

  it('should return an express router instance', function() {
    expect(helloIndex).to.equal(routerStub);
  });

  describe('GET /api/v1/hello', function() {

    it('should route to helloCtrl.helloWorld', function() {
      expect(routerStub.get
        .withArgs('/', 'helloCtrl.helloWorld')
      ).to.have.been.calledOnce;
    });

  });

});
