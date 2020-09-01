const bodyParser = require('body-parser');
const SentryProxy = require( '../../src/SentryProxy');

jest.mock('body-parser');
bodyParser.text = jest.fn(() => 'bodyParser.text');
bodyParser.json = jest.fn(() => 'bodyParser.json');

const sentryProxy = new SentryProxy('http://a@b/4');

const mockRouter = {};
mockRouter.use = jest.fn(middleware => mockRouter);
mockRouter.post = jest.fn((path, fn) => mockRouter);

const result = sentryProxy.attachToRouter(mockRouter);

test('adds 3 middlewares', () => {
    expect(mockRouter.use).toHaveBeenCalledTimes(3);
});

test('adds text body parser', () => {
    expect(mockRouter.use).toHaveBeenNthCalledWith(1, bodyParser.text());
});

test('adds json body parser', () => {
    expect(mockRouter.use).toHaveBeenNthCalledWith(2, bodyParser.json());
});

test('adds SENTRY_DSN middleware', () => {
    expect(mockRouter.use.mock.calls[2][0].toString()).toEqual(sentryProxy.addNewSentryDsnToRequest.bind(sentryProxy).toString());
});

test('adds Sentry API Endpoint', () => {
    expect(mockRouter.post).toHaveBeenCalledTimes(1);
    expect(mockRouter.post.mock.calls[0][0]).toEqual('/api/:sentryProjectId/store')
    expect(mockRouter.post.mock.calls[0][1].toString()).toEqual(sentryProxy.proxyRequestToSentry.bind(this).toString());
});

test('returns router', () => {
    expect(result).toBe(mockRouter);
});
