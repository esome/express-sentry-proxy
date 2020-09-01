const bodyParser = require('body-parser');
const request = require('request');

module.exports = class SentryProxy {

    constructor(originalSentryDsn) {
        this.originalSentryDsn = originalSentryDsn;
        this.sentryDsn = this._splitSentryDsn(this.originalSentryDsn);
    }

    attachToRouter(router) {
        router.use(bodyParser.text());
        router.use(bodyParser.json());
        router.use(this.addNewSentryDsnToRequest.bind(this));
        router.post('/api/:sentryProjectId/store', this.proxyRequestToSentry.bind(this));

        return router;
    }

    _splitSentryDsn(originalSentryDsn) {
        if (typeof originalSentryDsn !== 'string') {
            throw new Error('Sentry DSN must be a string!');
        }

        const sentryDsnSplit = originalSentryDsn.match(/^(https?):\/\/(.+?)@(.+?)\/(.+?)$/);

        if (!sentryDsnSplit || sentryDsnSplit.length != 5) {
            throw new Error('Could not parse Sentry DSN!');
        }
        
        const [, protocol, key, host, projectId] = sentryDsnSplit;
    
        return { protocol, key, host, projectId };
    }

    addNewSentryDsnToRequest(req, res, next) {
        const protocol = req.secure || req.get('x-forwarded-proto') ? 'https' : 'http';
        req.SENTRY_DSN = `${protocol}://${this.sentryDsn.key}@${req.headers.host}/${this.sentryDsn.projectId}`;
    
        return next();
    }

    proxyRequestToSentry(req, res) {
        // Sentry Client Side Library sends JSON as plain/text
        const body = (typeof req.body == 'string') ? JSON.parse(req.body) : req.body;
    
        // some headers must not be passed on to sentry request
        delete req.headers.host;
        delete req.headers.connection;
        delete req.headers['content-length'];
    
        request({ method: 'POST', url: this.sentryDsn.protocol + '://' + this.sentryDsn.host + req.path, headers: req.headers, qs: req.query, json: body })
        .on('error', error => { res.status(500).json(error) })
        .pipe(res);
    }

};
