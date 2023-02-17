const os = require('os');
const pmx = require('pmx');
const pm2 = require('pm2');
const request = require('request');

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

    let currentDate;
    let isNewElasticsearchVersion = null;

    request.get({
        url: config.elasticUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        strictSSL: !config.insecure
    }, (err, res) => {
        if (err) {
            console.error('cannot connect to elasticsearch!')
        } else {
            const body = JSON.parse(res.body);
            if (body.version.distribution === 'opensearch' || body.version.number.split('.')[0] >= 6) {
                isNewElasticsearchVersion = true;
            } else {
                isNewElasticsearchVersion = false;
            }
        }
    })

    function log(source, msg) {
        if (isNewElasticsearchVersion === null) {
            return;
        }

        const d = new Date();

        const data = {
            '@timestamp': d.toISOString(),
            host: config.host,
            source,
            id: msg.process.pm_id,
            process: msg.process.name,
            message: msg.data
        };

        const body = JSON.stringify(data);

        const date = d.getDate();
        if (date !== currentDate) {
            const index = config.index + '-' + d.getFullYear() + '.' + ('0' + (d.getMonth() + 1)).substr(-2) + '.' + ('0' + date).substr(-2);
            console.log('sending logs to', config.elasticUrl + '/' + index + '/' + config.type);
            currentDate = date;
        }

        if (isNewElasticsearchVersion) {
            request.put({
                url: `${config.elasticUrl}/_doc/${Date.now()}/`,
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

        } else {
            request.post({
                url: `${config.elasticUrl}/${index}/${config.type}/`,
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
    }

    pm2.launchBus((err, bus) => {
        if (err) {
            console.error('error on launching pm2 bus', err.message);
        }

        bus.on('log:err', data => {
            if (data.process.name !== 'pm2-logger-elasticsearch') {
                log('stderr', data);
            }
        });

        bus.on('log:out', data => {
            if (data.process.name !== 'pm2-logger-elasticsearch') {
                log('stdout', data);
            }
        });
    });
});
