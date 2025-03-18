'use client'
import { useState } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function Home() {
  const [extractedData, setExtractedData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({})

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

  const handleFileChange2 = async (event) => {
    const file = event.target.files[0]
    if (result && file && file.type === 'application/pdf'){
      
      setLoading(true)
      await processPDF2(file)
      setLoading(false)

    }else {
      alert("Please upload a valid PDF file.")
    }
  }

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
    let extracted = [];
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
        extracted.push(policyNumberMatch[1])
      } else {
        console.log("No match for policy number in line:", policyNumberLine);
      }
    }

    // Line 2: Extract Name and Vehicle (Line containing 'Nume/Denumire Asigurat')
    const nameAndVehicleLine = lines.find(line => line.includes("Nume/Denumire Asigurat"));
    console.log(nameAndVehicleLine);
    if (nameAndVehicleLine) {
      const name = nameAndVehicleLine.match(/([A-Z]+(?: [A-Z]+)+)(?= Fel)/)[0];
      const vehicle = nameAndVehicleLine.match(/\|\s*[A-Z],\s*([\w]+),\s*([\w]+)/)
      console.log(vehicle);
      if (name && vehicle) {
        extracted.push(name);
        // vehicle ? extracted.push(vehicle[1] + ' ' + vehicle[2]) : extracted.push()
      } else {
        console.log("No match for Name/Vehicle in line:", nameAndVehicleLine);
      }
    }

    // Line 3: Extract CNP and Vehicle Registration Number (Line containing 'CUI/CNP. Proprietar')
    const cnpAndRegNumberLine = lines.find(line => 
      ["C.N.P.", "CNP", "C.N.P. Proprietar"].some(keyword => line.includes(keyword))
  );
  
  console.log(cnpAndRegNumberLine);
  
  if (cnpAndRegNumberLine) {
      const cnpMatch = cnpAndRegNumberLine.match(/\d{13}/);
      const proprietarMatch = cnpAndRegNumberLine.match(/([A-Z]+\d+[A-Z]+)/);
  
      const cnp = cnpMatch ? cnpMatch[0] : null;
      const proprietar = proprietarMatch ? proprietarMatch[0] : "Nr. Inmatriculare nu exista in polita";
  
      if (cnp) {
          // extracted.push(cnp)
          extracted.push(proprietar)
      } else {
          console.log("No CNP found in line:", cnpAndRegNumberLine);
      }
  }

    // Line 4: Extract Vehicle Serial Number (Serie Sasiu)
    const serieSasiuLine = lines.find(line => line.includes("Serie CIV"));
    if (serieSasiuLine) {
      const serieSasiuMatch = serieSasiuLine.match(/(?<=Serie CIV\/\s*\|\s*)([A-Z0-9]+)/)[0];
      if (serieSasiuMatch) {
        // extracted.push(serieSasiuMatch)
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

    extracted.push(firstDate[0] + ' -' + secondDate)
  } else {
    console.log("No match for validity dates in line:", validityLine);
  }
}

    // If no matching data found, return fallback
    if (extracted === "") {
      extracted = "No matching data found in OCR text.";
    }

    setResult(extracted)

    console.log(result)

    return extracted;
  };

  const processPDF2 = async (file) => {
    const reader = new FileReader();
    reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let extractedText = ""; // Store OCR result

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const viewport = page.getViewport({ scale: 2 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;
            const imageDataURL = canvas.toDataURL("image/png");

            // Using Tesseract.js for OCR
            const worker = await createWorker("eng");
            const { data: { text } } = await worker.recognize(imageDataURL);
            await worker.terminate();

            extractedText += text + "\n"; // Append text from all pages
        }

        console.log("Raw OCR Text:", extractedText); // Debugging purpose

        // Convert extracted text to lowercase for case-insensitive comparison
        const extractedTextLower = extractedText.toLowerCase();

        // Extract values from results
        const id = result[0]; 
        const fullName = result[1]; // Example: "SUSNEA CONSTANTINA"
        const code = result[2]; // Example: "GL30RBS"
        const dateRange = result[3]; // Example: "12.12.2024 - 11.12.2025"

        const nameParts = fullName.split(" ");
        const lastName = nameParts[0]; 
        const firstName = nameParts.slice(1).join(" "); 

        // Convert name & code to lowercase for case-insensitive search
        const idLower = id.toLowerCase();
        const lastNameLower = lastName.toLowerCase();
        const firstNameLower = firstName.toLowerCase();
        const codeLower = code.toLowerCase();

        // Convert date range to actual Date objects
        const dateParts = dateRange.split(" - ");
        const startDate = new Date(dateParts[0].split('.').reverse().join('-'));
        const endDate = new Date(dateParts[1].split('.').reverse().join('-'));

        // Function to format dates as "DD.MM.YYYY"
        const formatDate = (date) => date.toISOString().split("T")[0].split("-").reverse().join(".");

        console.log("ID:", id);
        console.log("Last Name:", lastName);
        console.log("First Name:", firstName);
        console.log("Code:", code);
        console.log("Start Date:", formatDate(startDate));
        console.log("End Date:", formatDate(endDate));

        let foundItems = [];
        let missingItems = [];
        let dateFound = null;
        let isDateValid = false;

        // Search for ID
        if (extractedTextLower.includes(idLower)) {
            foundItems.push(`Found ID: ${id}`);
        } else {
            missingItems.push(`Missing ID: ${id}`);
        }

        // Search for First & Last Name
        const nameFound = extractedTextLower.includes(firstNameLower) && extractedTextLower.includes(lastNameLower);
        if (nameFound) {
            foundItems.push(`Found Name: ${firstName} ${lastName}`);
        } else {
            missingItems.push(`Missing Name: ${firstName} ${lastName}`);
        }

        // Search for Code
        if (extractedTextLower.includes(codeLower)) {
            foundItems.push(`Found Code: ${code}`);
        } else {
            missingItems.push(`Missing Code: ${code}`);
        }

        // Search for a valid date
        const dateRegex = /\b(\d{2})\.(\d{2})\.(\d{4})\b/g;
        let match;
        while ((match = dateRegex.exec(extractedTextLower)) !== null) {
            let foundDate = new Date(`${match[3]}-${match[2]}-${match[1]}`); // Convert to YYYY-MM-DD
            let formattedFoundDate = formatDate(foundDate);
            console.log("Found Date in Document:", formattedFoundDate);

            // Check if found date is within the valid range
            if (foundDate >= startDate && foundDate <= endDate) {
                isDateValid = true;
                dateFound = formattedFoundDate;
                foundItems.push(`The date (${formattedFoundDate}) is between (${formatDate(startDate)} - ${formatDate(endDate)})`);
                break; // Stop checking further if one valid date is found
            }
        }

        if (!dateFound) {
            missingItems.push(`No valid date found in range (${formatDate(startDate)} - ${formatDate(endDate)})`);
        }

        // Final Validation and Output
        let message = "";
        if (missingItems.length === 0 && isDateValid) {
            message = `✅ Good to go!\n\n${foundItems.join("\n")}`;
        } else {
            message = `❌ Not good to go!\n\n${foundItems.join("\n")}\n\n${missingItems.join("\n")}`;
        }

        alert(message);
    };

    reader.readAsArrayBuffer(file);
};







  const formatDate = (dateStr) => {
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    return `${day}.${month}.${year}`;
  };

  const regex = () => {
    const text = '0923913029'

    if(result.includes(text)){
      console.log("plsda")
    } else {
      console.log(false)
    }

  }


  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-3">PDF OCR GRAWE</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-3" />
      <input type="file" accept="application/pdf" onChange={handleFileChange2} className="mb-32" />
      {loading ? <p>Procesare...</p> : <pre className="w-full h-64 p-2 border">{extractedData}</pre>}
      <button onClick={regex}>buton</button>
    </div>
  );
}
