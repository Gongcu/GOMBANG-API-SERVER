const fs = require('fs');
const path = require('path');
var appDir = path.dirname(require.main.filename);

function fileDeleter(model) { 
    const banner = model.banner;
    const file = model.file;
    const image = model.image;
    const video = model.video;

    if (typeof banner != 'undefined')
        fs.unlink(appDir + '/upload/' + banner, (err) => {
            console.log(err);
        });

    for(var i=0; i<file.length; i++){
        fs.unlink(appDir+'/upload/'+file[i], (err) => {
            console.log(err);
        });
    }
    for(var i=0; i<image.length; i++){
        fs.unlink(appDir+'/upload/'+image[i], (err) => {
            console.log(err);
        });
    }
    for(var i=0; i<video.length; i++){
        fs.unlink(appDir+'/upload/'+video[i], (err) => {
            console.log(err);
        });
    }
}

module.exports = fileDeleter;