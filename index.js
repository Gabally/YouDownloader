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

function random_string(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/convert", (req, res) => {
    let request = req.body;
    let supported_formats = ["mp3", "wav", "vorbis", "m4a", "flac"];
    if (request.url !== undefined && request.url !== "" && request.format !== undefined && request.format !== "" && supported_formats.includes(request.format)) {
        youtubedl.exec(request.url, ["--extract-audio", "--audio-format", request.format, "--output", __dirname + "/songs/" + "%(title)s.%(ext)s"], {}, function (err, output) {
            if (err) {
                res.send(JSON.stringify({ "response": "downloaderror" }));
            }
            else {
                let outfname;
                output.forEach(e => {
                    if (e.includes("[ffmpeg] Destination: ")) {
                        outfname = path.basename(e.replace("[ffmpeg] Destination: ", ""));
                    }
                });
                res.send(JSON.stringify({ "response": "ok", "audiourl": ("/songs/" + outfname), "filename": outfname }));
            }
        })
    }
    else {
        res.send(JSON.stringify({ "response": "badrequest" }));
    }
});

app.get("/songs/:fname", (req, res) => {
    let fn = req.params["fname"];
    let filePath = path.join(__dirname, "songs", fn);
    res.download(filePath, fn, { dotfiles: "deny" }, function (err) {
        fs.unlink(filePath, (e) => { if (e) { console.log("Failed to delete file"); } });
    });
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname,  "public", "favicon.ico"));
});

console.log("Now listening on port " + port + "....");
const server = app.listen(port);