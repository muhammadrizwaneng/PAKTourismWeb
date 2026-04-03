import pypdf
import sys

def main():
    files = [
        "List of Hospitals in Balochistan, Pakistan.pdf",
        "List of Hospitals in Punjab, Pakistan.pdf",
        "List of Hospitals in Sindh, Pakistan.pdf"
    ]
    
    for f in files:
        try:
            reader = pypdf.PdfReader(f)
            text = ""
            for i in range(len(reader.pages)):
                text += reader.pages[i].extract_text()
            
            with open(f + ".txt", "w", encoding="utf-8") as out:
                out.write(text)
            print(f"Wrote {f}.txt")
        except Exception as e:
            print(f"Error {f}: {e}")

if __name__ == '__main__':
    main()
