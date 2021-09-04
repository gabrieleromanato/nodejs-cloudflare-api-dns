'use strict';

const https = require('https');
const TOKEN = 'your API token';

const request = (data = null, method = 'GET', endpoint = '') => {
    const options = {
        hostname: 'api.cloudflare.com',
        port: 443,
        path: '/client/v4/' + endpoint,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        }
    };

    if(method !== 'GET' && data !== null) {
        const json = JSON.stringify(data);
        options.headers['Content-Length'] = json.length;
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let body = '';
            res.on('data', d => {
                body += d;
            });
            res.on('end', () => {
               resolve(JSON.parse(body));
            });
        });

        req.on('error', err => {
            reject(err);
        });

        if(method !== 'GET' && data !== null) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};

class Cloudflare {
    static async getDNSZones(req, res) {
       try {
           const response = await  request(null, 'GET', 'zones');
           res.json(response);
       } catch(err) {
           res.json(err);
       }
    }
    static async getDNSZoneRecords(req, res) {
        const { id } = req.body;
        try {
            const response = await  request(null, 'GET', `zones/${id}/dns_records`);
            res.json(response);
        } catch(err) {
            res.json(err);
        }
    }

    static async addDNSRecord(req, res) {
        const { id, name, content, priority, ttl, type } = req.body;
        const prior = parseInt(priority, 10);
        const data = { name, content, priority: prior, ttl, type };
        try {
            const response = await  request(data, 'POST', `zones/${id}/dns_records`);
            res.json(response);
        } catch(err) {
            res.json(err);
        }

    }

    static async deleteDNSRecord(req, res) {
        const { zone_id, record_id } = req.body;
        try {
            const response = await  request(null, 'DELETE', `zones/${zone_id}/dns_records/${record_id}`);
            res.json(response);
        } catch(err) {
            res.json(err);
        }
    }
}

module.exports = Cloudflare;