import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceiptPDF = (student, amountPaid, receiptNo) => {
  const doc = new jsPDF();
  
  // Setup Fonts & Colors
  doc.setFont('helvetica');
  const primaryColor = [16, 185, 129]; // #10b981 Vibrant Green
  const textColor = [30, 41, 59]; // #1e293b Dark Gray
  const lightGray = [100, 116, 139];

  // Header Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 40, 'F');

  // Institution Header
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('THEEM COLLEGE OF ENGINEERING', 105, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Approved by AICTE | Affiliated to University of Mumbai', 105, 26, { align: 'center' });
  doc.text('TCOE Campus, Tech Park, Mumbai - 400001', 105, 32, { align: 'center' });

  // Receipt Title
  doc.setFontSize(16);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL FEE RECEIPT', 105, 55, { align: 'center' });

  // Receipt Metadata (Left & Right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: TCOE-FEE-${receiptNo}`, 14, 70);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 70);
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 150, 76);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 82, 196, 82);

  // Section: Student Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, 95);

  autoTable(doc, {
    startY: 100,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: textColor, fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    body: [
      ['Student Name', student.name.toUpperCase()],
      ['Enrollment Number / PRN', student.enrollment_no],
      ['Academic Branch', student.branch],
      ['Academic Year', student.year]
    ],
  });

  // Section: Payment Details
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', 14, doc.lastAutoTable.finalY + 15);

  const prevPaid = student.total_paid || 0;
  const newPaidTotal = prevPaid + Number(amountPaid);
  const remainingBalance = student.total_fee - newPaidTotal;

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: textColor, fontStyle: 'bold' },
    bodyStyles: { textColor: textColor, fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 100 }, 1: { halign: 'right' } },
    body: [
      ['Tuition Fee', `Rs. ${(student.tuition_fee || 0).toLocaleString()}`],
      ['Library Fee', `Rs. ${(student.library_fee || 0).toLocaleString()}`],
      ['Exam Fee', `Rs. ${(student.exam_fee || 0).toLocaleString()}`],
      ['Total Assigned Course Fee', `Rs. ${student.total_fee.toLocaleString()}`],
      ['Previously Paid Amount', `Rs. ${prevPaid.toLocaleString()}`],
      ['Current Payment Amount', `Rs. ${Number(amountPaid).toLocaleString()}`],
      ['Remaining Pending Balance', `Rs. ${remainingBalance.toLocaleString()}`]
    ],
  });

  // Highlight the Current Payment row in the table
  const finalY = doc.lastAutoTable.finalY;
  
  // Payment Mode & Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Payment Mode: Online / Admin Portal', 14, finalY + 15);
  doc.text('Status: SUCCESS', 14, finalY + 21);

  // Signatures
  doc.setDrawColor(100, 116, 139);
  doc.line(140, finalY + 40, 190, finalY + 40);
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Authorized Signatory', 165, finalY + 46, { align: 'center' });

  // Footer / Watermark
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated document and does not require a physical signature.', 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`TCOE_FeeReceipt_${student.enrollment_no}.pdf`);
};
