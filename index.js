const os = require('os');
const pmx = require('pmx');
const pm2 = require('pm2');
const request =	require('request');

pmx.initModule({}, (err, conf) => {
    if (err) {
        console.error('error on initalizing module', err.message);
    }

    const config = {
        index: conf.index || 'pm2',
        type: conf.type || 'pm2',
        host: conf.host || os.hostname(),
        elasticUrl: conf.elasticUrl || 'http://localhost:9200',
        insecure: conf.insecure || false
    };

    let url;
    let currentDate;

    function createMapping() {
        console.log('create mapping for field @timestamp');
        const data = {
            index_patterns: [config.index + '-*'], // eslint-disable-line camelcase
            mappings: {}
        };
        data.mappings[config.type] = {
            properties: {
                '@timestamp': {type: 'date'}
            }
        };
        request.put({
            url: config.elasticUrl + '/_template/' + config.index,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            strictSSL: !config.insecure
        }, err => {
            if (err) {
                console.error('error on creating mapping', err.message);
            }
        });
    }

    function log(source, msg) {
        const data = {
            '@timestamp': (new Date()).getTime(),
            host: config.host,
            source,
            id: msg.process.pm_id,
            process: msg.process.name,
            message: msg.data
        };

        const body = JSON.stringify(data);

        const d = new Date();
        const date = d.getDate();
        if (date !== currentDate) {
            const index = config.index + '-' + d.getFullYear() + '.' + ('0' + (d.getMonth() + 1)).substr(-2) + '.' + ('0' + date).substr(-2);
            console.log('sending logs to', config.elasticUrl + '/' + index + '/' + config.type);
            url = config.elasticUrl + '/' + index + '/' + config.type + '/';
            currentDate = date;
        }

        request.post({
            url,
            headers: {
                'Content-Type': 'application/json'
            },
            body,
            strictSSL: !config.insecure
        }, err => {
            if (err) {
                console.error('error on sending log message', err.message);
            }
        });
    }

    pm2.launchBus((err, bus) => {
        if (err) {
            console.error('error on launching pm2 bus', err.message);
        }

        createMapping();

        bus.on('log:err', data => {
            if (data.process.name !== 'pm2-elasticsearch-logger') {
                log('stderr', data);
            }
        });

        bus.on('log:out', data => {
            if (data.process.name !== 'pm2-elasticsearch-logger') {
                log('stdout', data);
            }
        });
    });
});
