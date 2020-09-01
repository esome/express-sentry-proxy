const SentryProxy = require( '../../src/SentryProxy');

const sentryProxy = new SentryProxy('http://a@b/4');


const res = {};
const next = jest.fn(() => {});

test('SENTRY_DSN with HTTPS is added for secure request', () => {
    const req = {
        headers: {
            host: 'example.com',
        },
        secure: true,
        get: key => req.headers[key],
    };
    sentryProxy.addNewSentryDsnToRequest(req, res, next);
    expect(req.SENTRY_DSN).toEqual('https://a@example.com/4');
});

test('SENTRY_DSN with HTTPS is added for secure proxy request', () => {
    const req = {
        headers: {
            host: 'example.com',
            'x-forwarded-proto': 'https',
        },
        get: key => req.headers[key],
    };
    sentryProxy.addNewSentryDsnToRequest(req, res, next);
    expect(req.SENTRY_DSN).toEqual('https://a@example.com/4');
});

test('SENTRY_DSN with HTTP is added for insecure request', () => {
    const req = {
        headers: {
            host: 'example.com',
        },
        get: key => req.headers[key],
    };
    sentryProxy.addNewSentryDsnToRequest(req, res, next);
    expect(req.SENTRY_DSN).toEqual('http://a@example.com/4');
});

test('next() is called', () => {
    next.mockClear();
    const req = {
        headers: {
            host: 'example.com',
        },
        get: key => req.headers[key],
    };
    sentryProxy.addNewSentryDsnToRequest(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
});
