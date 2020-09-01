const request = require('request');
jest.mock('request');

const SentryProxy = require( '../../src/SentryProxy');

const sentryProxy = new SentryProxy('http://a@b/4');

const req = {
    path: '/api/4/store',
    query: {
        'sentry_version': '7.1',
    },
    body: '{"some": "payload"}',
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

test('request is called', () => {
    expect(request).toHaveBeenCalledTimes(1);
});

test('request method is POST', () => {
    expect(request.mock.calls[0][0].method).toEqual('POST');
});

test('url is rewritten', () => {
    expect(request.mock.calls[0][0].url).toEqual('http://b/api/4/store');
});

test('some headers are deleted', () => {
    expect(request.mock.calls[0][0].headers).toEqual({
        'content-type': 'text/plain',
        'cache-control': 'whatever',
    });
});

test('query string is passed', () => {
    expect(request.mock.calls[0][0].qs).toEqual({
        'sentry_version': '7.1',
    });
});

test('body is passed as json object', () => {
    expect(request.mock.calls[0][0].json).toEqual({
        some: 'payload',
    });
});

test('error handler has been registered', () => {
    expect(mockRequest.on).toHaveBeenCalledTimes(1);
});

test('response is piped', () => {
    expect(mockRequest.pipe).toHaveBeenCalledTimes(1);
    expect(mockRequest.pipe).toHaveBeenCalledWith(res);
});

// const otherReq = { ...req, ...{ body: { someOther: 'Other Payload' }}};

// sentryProxy.proxyRequestToSentry(otherReq, res);

// test('body is passed as json object', () => {
//     expect(request.mock.calls[0][0].json).toEqual({
//         someOther: 'Other Payload',
//     });
// });
