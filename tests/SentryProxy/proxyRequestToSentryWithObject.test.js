const request = require('request');
jest.mock('request');

const SentryProxy = require( '../../src/SentryProxy');

const sentryProxy = new SentryProxy('http://a@b/4');

const req = {
    path: '/api/4/store',
    query: {
        'sentry_version': '7.1',
    },
    body: {
        someOther: "Other Payload"
    },
    headers: {
        connection: 'keep-alive',
        host: 'example.com',
        'content-length': 12,
        'content-type': 'text/plain',
        'cache-control': 'whatever',
    },
};
const res = {};

const mockRequest = {}
mockRequest.on = jest.fn((param, callback) => mockRequest);
mockRequest.pipe = jest.fn(target => mockRequest);

request.mockReturnValue(mockRequest);

sentryProxy.proxyRequestToSentry(req, res);

test('body is passed as json object', () => {
    expect(request.mock.calls[0][0].json).toEqual({
        someOther: 'Other Payload',
    });
});
