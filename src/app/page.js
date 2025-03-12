'use client'
import { useState } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function Home() {
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
      console.log("Formatted Extracted Data:", formattedText);
    };

    reader.readAsArrayBuffer(file);
  };

  // Extract structured data from OCR text
  const extractRelevantDataFromOCR = (ocrText) => {
    let extracted = "";
    const lines = ocrText.split("\n");

    // Print the lines for debugging purposes (to identify where data is)
    lines.forEach((line, index) => {
      console.log(`Line ${index + 1}: ${line}`);
    });

    // Line 1: Extract Policy Number (Line containing 'Nr.' after 'CONTRACT DE ASIGURARE')
    const policyNumberLine = lines.find(line => line.includes("CONTRACT DE ASIGURARE"));
    if (policyNumberLine) {
      const policyNumberMatch = policyNumberLine.match(/Nr\.\s*(\d{9,})/); // Match 9+ digits for policy number
      if (policyNumberMatch) {
        extracted += `📌 Numar Polita: ${policyNumberMatch[1]}\n`;
      } else {
        console.log("No match for policy number in line:", policyNumberLine);
      }
    }

    // Line 2: Extract Name and Vehicle (Line containing 'Nume/Denumire Asigurat')
    const nameAndVehicleLine = lines.find(line => line.includes("Nume/Denumire Asigurat"));
    if (nameAndVehicleLine) {
      const name = nameAndVehicleLine.match(/([A-Z]+(?: [A-Z]+)+)(?= Fel)/)[0];
      const vehicle = nameAndVehicleLine.match(/(?<=\s[A-Z],\s)([A-Z]+(?:, [A-Z]+)+)/)[0]
      if (name && vehicle) {
        extracted += `📌 Nume Asigurat: ${name}\n`;
        extracted += `📌 Marca/Model Asigurat: ${vehicle}\n`;
      } else {
        console.log("No match for Name/Vehicle in line:", nameAndVehicleLine);
      }
    }

    // Line 3: Extract CNP and Vehicle Registration Number (Line containing 'CUI/CNP. Proprietar')
    const cnpAndRegNumberLine = lines.find(line => line.includes("CUI/CNP. Proprietar"));
    if (cnpAndRegNumberLine) {
      const cnp = cnpAndRegNumberLine.match(/\d{13}/)[0];
      const proprietar = cnpAndRegNumberLine.match(/([A-Z]+\d+[A-Z]+)/)[0];
      if (cnp && proprietar) {
        extracted += `📌 CNP Proprietar: ${cnp}\n`;
        extracted += `📌 Nr. Inmatriculare ${proprietar}\n`;
      } else {
        console.log("No match for CNP/Registration in line:", cnpAndRegNumberLine);
      }
    }

    // Line 4: Extract Vehicle Serial Number (Serie Sasiu)
    const serieSasiuLine = lines.find(line => line.includes("Serie CIV"));
    if (serieSasiuLine) {
      const serieSasiuMatch = serieSasiuLine.match(/(?<=Serie CIV\/\s*\|\s*)([A-Z0-9]+)/)[0];
      if (serieSasiuMatch) {
        extracted += `📌 VIN: ${serieSasiuMatch}\n`;
      } else {
        console.log("No match for Serie Sasiu in line:", serieSasiuLine);
      }
    }

    // Line 5: Extract Validity Dates (Line containing 'Valabilitate Contract')
    const validityLine = lines.find(line => line.includes("Valabilitate Contract"));
if (validityLine) {
  const firstDate = validityLine.match(/\d{2}\.\d{2}\.\d{4}/); // Match the first date with dots
  let secondDate = validityLine.match(/\d{8} | \d{2}\.\d{2}\.\d{4}/); // Match the second date either with or without dots

  if (firstDate && secondDate) {
    // If secondDate contains dots already, use it as is
    if (secondDate[0].includes(".")) {
      secondDate = secondDate[0]; // No change, as it's already in DD.MM.YYYY format
    } else {
      // If secondDate doesn't contain dots, format it
      secondDate = formatDate(secondDate[0]);
    }

    extracted += `📌 Valabilitate: De la ${firstDate[0]} pana la ${secondDate}\n`;
  } else {
    console.log("No match for validity dates in line:", validityLine);
  }
}

    // If no matching data found, return fallback
    if (extracted === "") {
      extracted = "No matching data found in OCR text.";
    }

    return extracted;
  };

  const formatDate = (dateStr) => {
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    return `${day}.${month}.${year}`;
  };

  // const line = "Nume/Denumire Asigurat. | SCURTU GEORGE LAURENTIU Fel, Tip, Marca, | A, FORD, FUSION"

  // console.log(line.match(/([A-Z]+(?: [A-Z]+)+)(?= Fel)/)[0])

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-3">PDF OCR GRAWE</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-3" />
      {loading ? <p>Procesare...</p> : <pre className="w-full h-64 p-2 border">{extractedData}</pre>}
    </div>
  );
}
