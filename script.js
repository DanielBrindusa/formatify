function convertImage() {
    const fileInput = document.getElementById("fileInput");
    const format = document.getElementById("format").value;
    const sizeOption = document.getElementById("outputSize").value;

    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload a file");
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        let width, height;

        if (sizeOption === "original") {
            width = img.naturalWidth;
            height = img.naturalHeight;
        } else {
            width = parseInt(sizeOption);
            height = parseInt(sizeOption);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const link = document.getElementById("downloadLink");

        if (format === "ico" && sizeOption === "original") {
            alert("For best compatibility, ICO files should use standard sizes (16–256px).");
        }

        let mime = "image/png";
        if (format === "jpg" || format === "jpeg") mime = "image/jpeg";

        link.href = canvas.toDataURL(mime);
        link.download = "converted." + format;
        link.style.display = "block";
        link.innerText = "Download " + format.toUpperCase();
    };
}
