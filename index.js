const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const youtubedl = require("youtube-dl")
const fs = require("fs")

const config = JSON.parse(fs.readFileSync("config.json"));
const port = config.port;
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/convert", (req, res) => {
    let request = req.body;
    let supported_formats = ["mp3", "wav", "vorbis", "m4a", "flac"];
    if (request.url !== undefined && request.url !== "" && request.format !== undefined && request.format !== "" && supported_formats.includes(request.format)) {
        youtubedl.exec(request.url, ["--extract-audio", "--audio-format", request.format, "--output", __dirname + "/songs/" + "%(title)s.%(ext)s"], {}, function (err, output) {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ "response": "downloaderror" }));
            }
            else {
                let outfname;
                output.forEach(e => {
                    if (e.includes("[ffmpeg] Destination: ")) {
                        outfname = path.basename(e.replace("[ffmpeg] Destination: ", ""));
                    }
                });
                let filePath = path.join(__dirname, "songs", outfname);
                let songContent = fs.readFileSync(filePath);
                fs.unlink(filePath, (e) => { if (e) { console.log("Failed to delete file"); } });
                res.send(JSON.stringify({ "response": "ok", "audiourl": songContent.toString("base64"), "filename": outfname }));
            }
        })
    }
    else {
        res.send(JSON.stringify({ "response": "badrequest" }));
    }
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname,  "public", "favicon.ico"));
});

app.use("/public", express.static(path.join(__dirname, "public")));

console.log("Now listening on port " + port + "....");
const server = app.listen(port);