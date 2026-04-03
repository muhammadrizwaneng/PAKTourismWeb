const fs = require('fs');
const pdf = require('pdf-parse');

async function extractText(pdfPath) {
    let dataBuffer = fs.readFileSync(pdfPath);
    try {
        let data = await pdf(dataBuffer);
        return data.text;
    } catch(err) {
        console.error("Error reading " + pdfPath, err);
        return "";
    }
}

async function main() {
    const files = [
        "List of Hospitals in Balochistan, Pakistan.pdf",
        "List of Hospitals in Punjab, Pakistan.pdf",
        "List of Hospitals in Sindh, Pakistan.pdf"
    ];
    
    for (const f of files) {
        let text = await extractText(f);
        fs.writeFileSync(f + ".txt", text);
        console.log("Wrote " + f + ".txt");
    }
}

main();
