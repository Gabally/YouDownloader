function download_audio() {
    let input = document.getElementById("vidurl");
    let format = document.getElementById("format");
    let url = input.value;
    if (url === "" || url == undefined) {
        input.setCustomValidity("Video URL cannnot be empty");
        input.reportValidity();
        setTimeout(function () {
            input.setCustomValidity("");
            input.reportValidity();
        }, 2500);
    }
    else {
        this.disabled = true;
        input.disabled = true;
        format.disabled = true;
        fetch("convert", {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "url": url, "format": format.value })
        }).then(response => response.json()).then(data => {
            if (data.response === "ok") {
                let dw = document.createElement("a");
                dw.href = "data:application/octet-stream;base64," + data.audiourl;
                dw.setAttribute("download", data.filename);
                dw.click();
            }
            else if (data.response === "downloaderror") {
                input.setCustomValidity("An error occoured while converting (check yor URL)");
                input.reportValidity();
                setTimeout(() => {
                    input.setCustomValidity("");
                    input.reportValidity();
                }, 2500);
            }
            this.disabled = false;
            input.disabled = false;
            format.disabled = false;
        });
    }
}
document.getElementById("downloadbtn").addEventListener("click", download_audio);