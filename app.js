var express = require('express');
var fs = require('fs');
var path = require('path');
var im = require('imagemagick');
var images = require('images');

var app = express();

// static files
app.use('/images', express.static(path.join(__dirname, 'images')));
// process multipart form
app.use('/upload', require('connect-multiparty')());

app.get('/', function(req, res){
    res.send(
        '<form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="source">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
});

app.post('/upload', function(req, res){
    // console.log(req.body.userid);
    // console.log(req.body.username);
	console.log('Received file:\n' + JSON.stringify(req.files));
	
	var imageDir = path.join(__dirname, 'images');
	var imagePath = path.join(imageDir, req.files.source.name);
    var smallImageDir = path.join(__dirname, 'smallimages');
    var smallImagePath = path.join(smallImageDir, req.files.source.name)
    // if exists
    fs.stat(imagePath, function(err, stat) {
        if (err && err.code !== 'ENOENT') {
            res.writeHead(500);
            res.end('fs.stat() error');
        }
        else {
            // already exists, gen a new name
            if (stat && stat.isFile()) {
            	var curtime =  new Date().getTime();
            	console.log("===============");
            	console.log(curtime);
            	console.log("===============");
                imagePath = path.join(imageDir, curtime + req.files.source.name);
                smallImagePath = path.join(smallImageDir, curtime + req.files.source.name);
            }

            // rename
            try{
	            fs.renameSync(req.files.source.path,imagePath);

	            images(imagePath).size(200).save(smallImagePath,{quality:80});
	            res.send("ok");
            } catch(e){
            	console.log("writing error")
            }
                        // im.resize({
                        //     srcData: fs.readFileSync(imagePath,'binary'),
                        //     width: 100
                        // }, function(err, stdout, stderr){
                        //     if (err) throw err;
                        //     fs.writeFileSync(smallImagePath,stdout,'binary');
                        //     console.log("resized!!!!!!!!!!!!!!");
                        // });            
        }
    });

});

app.get('/info', function(req, res){
    var imageNames = fs.readdirSync('images');
    var imagesMsg=[];
    for(var i=0;i<imageNames.length;i++){
    	img={};
        img.name=imageNames[i];
        img.time=fs.statSync("images/"+img.name).ctime;
        imagesMsg.push(img);
    }
    res.send(imagesMsg);
});

app.get('/smallinfo', function(req, res){
    var smallImageNames = fs.readdirSync('smallimages');
    var smallImagesMsg=[];
    for(var i=0;i<smallImageNames.length;i++){
        smallimg={};
        smallimg.name=smallImageNames[i];
        smallimg.time=fs.statSync("smallimages/"+smallimg.name).ctime;
        smallImagesMsg.push(smallimg);
    }
    res.send(smallImagesMsg);
});

app.listen(3000);
