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
res.status = jest.fn(code => res);
res.json = jest.fn(obj => res);

const mockRequest = {}
mockRequest.on = jest.fn((param, callback) => mockRequest);
mockRequest.pipe = jest.fn(target => mockRequest);

request.mockReturnValue(mockRequest);

sentryProxy.proxyRequestToSentry(req, res);

mockRequest.on.mock.calls[0][1](new Error('HELLO?'));

test('Error Handler sets status to 500', () => {
    expect(res.status.toHaveBeenCalledTimes(1));
    expect(res.status.toHaveBeenCalledWith(500));
});

test('Error Handler returns json', () => {
    expect(res.json.toHaveBeenCalledTimes(1));
    expect(res.json.toHaveBeenCalledWith({}));
});
