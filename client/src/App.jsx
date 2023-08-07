import { useState } from "react";
import Container from "./components/Container";
import { pdfjs, Document, Page } from "react-pdf";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function App() {
  const [showPdf, setShowPdf] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  async function handleSave() {
    const formValues = {
      textFields: [],
      choiceFields: [],
      radioFields: {},
    };

    const textFields = document.querySelectorAll(".textWidgetAnnotation input");

    const choiceFields = document.querySelectorAll(
      ".choiceWidgetAnnotation select"
    );
    const radioButtons = document.querySelectorAll(
      ".buttonWidgetAnnotation input"
    );

    const radioLabels = [];
    let radioLabelsCounter = -1;
    let prevTop = 0;

    document.querySelectorAll('span[role="presentation"]').forEach((span) => {
      if (span.textContent.trim() !== "") {
        const value = span.textContent.trim();
        if (radioLabelsCounter === -1 || prevTop !== span.style.top) {
          radioLabelsCounter += 1;
          radioLabels[radioLabelsCounter] = [value];
          prevTop = span.style.top;
        } else {
          radioLabels[radioLabelsCounter] = [
            ...radioLabels[radioLabelsCounter],
            value,
          ];
        }
      }
    });

    for (const textField of textFields) {
      formValues.textFields = [...formValues.textFields, textField.value];
    }

    for (const choiceField of choiceFields) {
      const options = choiceField.querySelectorAll("option");

      for (const option of options) {
        if (option.selected)
          formValues.choiceFields = [...formValues.choiceFields, option.value];
      }
    }

    let radioCounter = 0;

    for (const radioButton of radioButtons) {
      const name = radioButton.name;
      if (name in formValues.radioFields) continue;

      if (radioButton.checked) {
        const value = radioLabels[radioCounter++].shift();
        formValues.radioFields[name] = value;
      } else radioLabels[radioCounter].shift();
    }

    const response = await fetch("http://localhost:3000/api/pdf", {
      method: "PATCH",
      body: JSON.stringify(formValues),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) alert("PDF saved successfully!");
    else alert("Something went wrong!");
  }

  return (
    <Container>
      <button
        onClick={() => {
          setShowPdf(true);
        }}
      >
        Load PDF
      </button>{" "}
      <button disabled={!showPdf} onClick={handleSave}>
        Save PDF
      </button>
      {showPdf ? (
        <>
          <Document
            file="http://localhost:3000/example.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} renderForms />
          </Document>
          <div style={{ display: numPages === 0 ? "hidden" : "block" }}>
            <button
              disabled={pageNumber === 1}
              onClick={() => {
                setPageNumber(pageNumber - 1);
              }}
            >
              Prev
            </button>
            <button
              disabled={pageNumber === numPages}
              onClick={() => {
                setPageNumber(pageNumber + 1);
              }}
            >
              Next
            </button>
            <p>
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </>
      ) : (
        <></>
      )}
    </Container>
  );
}
