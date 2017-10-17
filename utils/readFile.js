import fs from 'fs';

export default (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
};