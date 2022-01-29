async function download_audio() {
    let input = document.getElementById("vidurl");
    let format = document.getElementById("format");
    try {
        let url = input.value;
        if (!url) {
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
            let resp = await fetch("convert", {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "url": url, "format": format.value })
            });
            if (resp.status === 200) {
                let song = await resp.blob();
                let link = document.createElement("a");
                link.download = `${resp.headers.get("Video-Name")}.${format.value}`;
                link.href = URL.createObjectURL(song);
                link.click();
            } else {
                alert("An error occurred while downloading the video's audio");
            }
            this.disabled = false;
            input.disabled = false;
            format.disabled = false;
        }
    } catch(e) {
        this.disabled = false;
        input.disabled = false;
        format.disabled = false;
        alert("An error occurred while downloading the video's audio");
    }
}
document.getElementById("downloadbtn").addEventListener("click", download_audio);