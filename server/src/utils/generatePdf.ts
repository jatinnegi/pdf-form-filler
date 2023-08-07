import { PDFDocument, PDFTextField, PDFDropdown, PDFRadioGroup } from 'pdf-lib';

async function generatePdf(
  formValues: Record<string, string[] | Record<string, string>>,
) {
  const formUrl = 'http://localhost:3000/example.pdf';
  const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  const fields = form.getFields();

  for (const field of fields) {
    if (field instanceof PDFTextField && Array.isArray(formValues.textFields)) {
      field.setText(formValues.textFields.shift());
    } else if (
      field instanceof PDFDropdown &&
      Array.isArray(formValues.choiceFields)
    ) {
      field.select(formValues.choiceFields.shift());
    } else if (field instanceof PDFRadioGroup) {
      const name = field.getName();
      const value = formValues.radioFields[name];
      field.select(value);
    } else;
  }

  const pdfBytes = await pdfDoc.save();
  const bytes = new Uint8Array(pdfBytes);
  // const blob = new Blob([bytes], { type: 'application/pdf' });

  return bytes;
}

export default generatePdf;
