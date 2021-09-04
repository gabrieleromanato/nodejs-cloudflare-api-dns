'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();
const Cloudflare = require('./classes/Cloudflare');


app.disable('x-powered-by');

app.use('/public', express.static(path.join(__dirname, '/public'), {
    maxAge: 0,
    dotfiles: 'ignore',
    etag: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname) + '/views/index.html');
});

app.get('/api/dns-zones', Cloudflare.getDNSZones);
app.post('/api/zone-records', Cloudflare.getDNSZoneRecords);
app.post('/api/add-record', Cloudflare.addDNSRecord);
app.post('/api/delete-record', Cloudflare.deleteDNSRecord);


if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
    });
}

app.use((err, req, res, next) => {
    res.status(err.status || 500);
});

app.listen(port);