import fs from 'fs';

export default (path, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, (err) => {
            err ? reject(err) : resolve();
        });
    });
};