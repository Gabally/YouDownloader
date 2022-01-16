require("dotenv").config();
const express = require("express");
const path = require("path");
const youtubedl = require("youtube-dl");
const fs = require("fs");

let app = express();
app.use(express.json());

app.post("/convert", (req, res) => {
    let request = req.body;
    let supported_formats = ["mp3", "wav", "vorbis", "m4a", "flac"];
    if (request.url !== undefined && request.url !== "" && request.format !== undefined && request.format !== "" && supported_formats.includes(request.format)) {
        youtubedl.exec(request.url, ["--extract-audio", "--audio-format", request.format, "--output", __dirname + "/songs/" + "%(title)s.%(ext)s"], {}, function(err, output) {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ "response": "downloaderror" }));
            } else {
                let outfname;
                output.forEach(e => {
                    if (e.includes("[ffmpeg] Destination: ")) {
                        outfname = path.basename(e.replace("[ffmpeg] Destination: ", ""));
                    }
                });
                let filePath = path.join(__dirname, "songs", outfname);
                let songContent = fs.readFileSync(filePath);
                fs.unlink(filePath, (e) => { if (e) { console.log("Failed to delete file"); } });
                res.json({ "response": "ok", "audiourl": songContent.toString("base64"), "filename": outfname });
            }
        })
    } else {
        res.json({ "response": "badrequest" });
    }
});

app.use("/", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Now listening on port ${port}...`);
});