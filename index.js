const express = require('express');
const SentryProxy = require('./src/SentryProxy');

module.exports = (originalSentryDsn) => {

    const router = express.Router();
    const sentryProxy = new SentryProxy(originalSentryDsn);

    sentryProxy.attachToRouter(router);

    return router;
};
