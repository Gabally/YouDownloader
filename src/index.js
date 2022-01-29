require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const crypto = require("crypto");
const os = require("os");
const ytdl = require("ytdl-core");

const generateTempFilePath = () => {
    let file = crypto.randomBytes(16).toString("hex");
    return path.join(os.tmpdir(), file);
};

const ytdlwrapper = async (url) => {
    return new Promise((resolve,reject)=>{
        let stream = ytdl(url, {filter: "audioonly", quality: "highestaudio" }).on("error", () => reject("Error while downloading"));
        resolve(stream);
    }); 
} 

let app = express();

app.use(express.json());

app.post("/convert", async (req, res) => {
    try {
        let { url, format } = req.body;
        let supported_formats = ["mp3", "wav", "m4a", "ogg"];
        if (url && format && supported_formats.includes(format)) {
            let stream = await ytdlwrapper(url);
            let vidInfo = await ytdl.getInfo(url);
            let tempFile = `${generateTempFilePath()}.${format}`;
            ffmpeg(stream)
            .audioBitrate(128)
            .save(tempFile)
            .on("end", () => {
                res.status(200);
                res.setHeader("Content-Type", `audio/${format}`);
                res.setHeader("Video-Name", vidInfo.videoDetails.title);
                fs.createReadStream(tempFile).pipe(res);
            })
            .on("error", () => {
                res.status(500).send("error");
            });
        } else {
            res.status(400).send("missing parameters");
        }
    } catch(e) {
        res.status(500).send("error");
    }
});

app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Now listening on port ${port}...`);
});