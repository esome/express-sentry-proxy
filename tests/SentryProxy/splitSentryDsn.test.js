const SentryProxy = require( '../../src/SentryProxy');

const sentryProxy = new SentryProxy('http://a@b/4');

test('missing DSN throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn()).toThrow(new Error('Sentry DSN must be a string!'));
});

test('null throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn(null)).toThrow(new Error('Sentry DSN must be a string!'));
});

test('undefined throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn(undefined)).toThrow(new Error('Sentry DSN must be a string!'));
});

test('Bogus DSN throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn('asdfg')).toThrow(new Error('Could not parse Sentry DSN!'));
});

test('Missing Protocol throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn('mytestkey@mytesthost.com/23')).toThrow(new Error('Could not parse Sentry DSN!'));
});

test('Missing Key throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn('http://mytesthost.com/23')).toThrow(new Error('Could not parse Sentry DSN!'));
});

test('Missing Project Id throws Error', () => {
    expect(() => sentryProxy._splitSentryDsn('http://mytestkey@mytesthost.com/')).toThrow(new Error('Could not parse Sentry DSN!'));
});

test('Custom HTTP DSN is split correctly', () => {
    expect(sentryProxy._splitSentryDsn('http://mytestkey@mytesthost.com/23')).toEqual(
        {
            protocol: 'http',
            key: 'mytestkey',
            host:'mytesthost.com',
            projectId: '23',
        }
    );
});

test('Custom HTTPs DSN is split correctly', () => {
    expect(sentryProxy._splitSentryDsn('https://mytestkey@mytesthost.com/23')).toEqual(
        {
            protocol: 'https',
            key: 'mytestkey',
            host:'mytesthost.com',
            projectId: '23',
        }
    );
});
