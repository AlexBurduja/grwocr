'use client'
import { useState } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function Scan(){
  
    const [extractedData, setExtractedData] = useState("");
      const [loading, setLoading] = useState(false);
    
      const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
          setLoading(true);
          await processPDF(file);
          setLoading(false);
        } else {
          alert("Please upload a valid PDF file.");
        }
      };
    
      const processPDF = async (file) => {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
    
          // Process the first page
          const page = await pdf.getPage(1);
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          const viewport = page.getViewport({ scale: 2 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
    
          await page.render({ canvasContext: context, viewport }).promise;
    
          const imageDataURL = canvas.toDataURL("image/png");
    
          // Using Tesseract.js OCR to process image
          const worker = await createWorker("eng");
          const { data: { text } } = await worker.recognize(imageDataURL);
          await worker.terminate();
    
          console.log("Raw OCR Text:", text); // Log OCR result to debug
    
          // Now let's check if OCR worked correctly before continuing
          if (text.trim() === "") {
            console.error("OCR did not recognize any text!");
            setExtractedData("OCR did not recognize any text. Please check the PDF.");
            return;
          }
    
          // Clean and extract structured data
          const formattedText = extractRelevantDataFromOCR(text);
          setExtractedData(formattedText);
          // console.log("Formatted Extracted Data:", formattedText);
        };
    
        reader.readAsArrayBuffer(file);
      };

      const extractRelevantDataFromOCR = (ocrText) => {
        let extracted = '';
        const lines = ocrText.split("\n");
    
        // Print the lines for debugging purposes
        lines.forEach((line, index) => {
            console.log(`Line ${index + 1}: ${line}`);
            if (line.includes("095071156")) {
                extracted += `Nr polita ☑️`;
            }
        });
    
        return extracted || "Number not found in the text.";
    };

    
    return (
        <>
            <div className="p-5">
                <h2 className="text-xl font-bold mb-3">SIMPLE SCAN</h2>
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-3" />
                {loading ? <p>Procesare...</p> : <pre className="w-full h-64 p-2 border">{extractedData}</pre>}
            </div>
        </>
    );
};