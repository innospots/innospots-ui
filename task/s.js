
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const csv = require('csvtojson');

const filePath = path.resolve('./src');

const getKeys = (object, keys) => {
    const key = _.keys(object);

    if (object[key]) {
        if (_.isString(object[key])) {
            keys.push(object[key]);
        }
        getKeys(object[key], keys)
    }
}

const excludes = [
    '.umi',
    '.png',
    'e2e',
    'Icons/',
];

const isExclude = (filePath) => !!_.find(excludes, s => filePath.indexOf(s) < 0);

const fileDisplay = (filePath, callback) => {
    fs.readdir(filePath, (err, files) => {
        if (!err) {
            files.forEach((fileName) => {
                const fileDir = path.join(filePath, fileName);
                fs.stat(fileDir,  (error, stats) => {
                    if (error) {
                        console.error(error)
                    } else {
                        const isFile = stats.isFile();
                        const isDirectory = stats.isDirectory();
                        if (isDirectory) {
                            fileDisplay(fileDir, callback)
                        } else if (isFile && !isExclude(fileDir)) {
                            callback && callback(fileDir)
                        }
                    }
                })
            })
        } else {
            console.error(err)
        }
    })
}

csv()
.fromFile('./source.csv')
.then(jsonArr => {
    const sourceKeys = [];

    jsonArr.forEach(json => {
        getKeys(json, sourceKeys);
    })

    csv()
    .fromFile('./target.csv')
    .then(jsonArr => {
        const targetKeys = [];

        jsonArr.forEach(json => {
            getKeys(json, targetKeys);
        })

        fileDisplay(filePath, _filePath => {
            fs.readFile(_filePath, 'utf-8', (err, content) => {
                _.each(sourceKeys, (source, index) => {
                    const target = targetKeys[index];
                    content = content.replace(new RegExp(source, 'gi'), target);
                })

                fs.writeFile(_filePath, content, 'utf-8', (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.info(_filePath)
                    }
                });
            })
        })
    })
})