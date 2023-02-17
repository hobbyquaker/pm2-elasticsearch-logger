# pm2-logger-elasticsearch

[![npm version](https://badge.fury.io/js/pm2-logger-elasticsearch.svg)](https://badge.fury.io/js/pm2-logger-elasticsearch) 
[![dependencies Status](https://david-dm.org/tavsta/pm2-logger-elasticsearch/status.svg)](https://david-dm.org/tavsta/pm2-logger-elasticsearch)
[![Build Status](https://travis-ci.org/tavsta/pm2-logger-elasticsearch.svg?branch=master)](https://travis-ci.org/tavsta/pm2-logger-elasticsearch)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License][mit-badge]][mit-url]

> Module that sends logs of processes controlled by [PM2](https://pm2.io) to Elasticsearch/Opensearch 📒🔍


## Install

`pm2 install pm2-logger-elasticsearch`


## Configuration

Set options with the command

`pm2 set pm2-logger-elasticsearch:<option> <value>`

PM2 will automatically restart the module after changing an option.

#### Options

| option |           | default |
| ------ | --------- | ------- |
| elasticUrl | URL of Elasticsearch/Opensearch API | `http://localhost:9200` |
| insecure | allow https connections to servers with invalid certificate | `false` |
| index | Elasticsearch/Opensearch index to use | `pm2` |
| type | Document type to use | `pm2` |
| host | `host` attribute of the document | `os.hostname()` |


## Todo, Ideas

* Configurable document attributes
* Create mapping for `@timestamp` only if neccessary, control by config option


## Contributing

Pull Requests welcome!


## License

MIT (c) 2019 Sebastian Raff

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
