import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  let remainingHeight = imgHeight;
  let offsetY = 0;

  while (remainingHeight > 0) {
    if (offsetY > 0) pdf.addPage();
    const sliceHeight = Math.min(remainingHeight, pageHeight - margin * 2);
    pdf.addImage(imgData, 'PNG', margin, margin - offsetY, contentWidth, imgHeight);
    remainingHeight -= sliceHeight;
    offsetY += sliceHeight;
  }

  pdf.save(filename);
}
