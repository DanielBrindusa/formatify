function convertFile() {
    const file = document.getElementById("fileInput").files[0];
    const format = document.getElementById("formatSelect").value;
    const size = document.getElementById("sizeSelect").value;

    if (!file) return alert("Upload a file");

    const img = new Image();
    const reader = new FileReader();

    reader.onload = function(e) {
        img.src = e.target.result;
    };

    img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (size !== "original") {
            width = parseInt(size);
            height = parseInt(size);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let mime = "image/png";
        if (format === "jpg" || format === "jpeg") mime = "image/jpeg";

        const dataUrl = canvas.toDataURL(mime);

        const link = document.getElementById("downloadLink");
        link.href = dataUrl;
        link.download = "converted." + format;
        link.style.display = "block";
        link.innerText = "Download File";
    };

    reader.readAsDataURL(file);
}
