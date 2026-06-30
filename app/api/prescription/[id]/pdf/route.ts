import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const userId = await getSessionUserId();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch the prescription, consultation details, and patient profile
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      consultation: true,
      appointment: {
        include: {
          patient: true,
        },
      },
      medicines: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!prescription) {
    return new NextResponse("Prescription not found", { status: 404 });
  }

  // Security check: Only the clinic doctor or the specific patient can access
  if (user.role !== "DOCTOR" && prescription.patientId !== user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const pdfBuffer = await generatePrescriptionPdfBuffer(prescription);

    // Format content-disposition header to trigger clean direct PDF attachment download
    const filename = `prescription_${prescription.appointmentId}.pdf`;
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse("Error generating PDF file", { status: 500 });
  }
}

async function generatePrescriptionPdfBuffer(prescription: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // 1. Clinic Letterhead Header
    doc.fillColor("#064e3b").fontSize(20).text("AYURCLINIC & WELLNESS", { align: "center" });
    doc.fillColor("#64748b").fontSize(9).text("Holistic Ayurvedic Healing & Panchakarma Center", { align: "center" });
    doc.moveDown(1);

    const startDoctorY = doc.y;
    doc.fillColor("#1e293b").fontSize(9).text("Dr. Priyadarshini Sen, B.A.M.S", 50, startDoctorY);
    doc.fillColor("#64748b").fontSize(8).text("Senior Ayurvedic Physician", 50, startDoctorY + 12);

    doc.fillColor("#1e293b").fontSize(8).text("Contact: +91 99999 99999", 350, startDoctorY, { align: "right" });
    doc.fillColor("#64748b").text("Email: doctor@example.com", 350, startDoctorY + 12, { align: "right" });
    doc.moveDown(2);

    // Green separator line
    doc.strokeColor("#065f46").lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // 2. Patient Details Grid
    const startY = doc.y;
    doc.fillColor("#475569").fontSize(9).text("Patient Name:", 50, startY);
    doc.fillColor("#0f172a").text(prescription.appointment.patient.fullName, 120, startY);

    doc.fillColor("#475569").text("Date:", 320, startY);
    doc.fillColor("#0f172a").text(new Date(prescription.createdAt).toLocaleDateString("en-IN"), 390, startY);

    doc.fillColor("#475569").text("Age / Gender:", 50, startY + 16);
    const ageGen = [prescription.appointment.patient.age ? `${prescription.appointment.patient.age} Yrs` : null, prescription.appointment.patient.gender].filter(Boolean).join(" / ") || "N/A";
    doc.fillColor("#0f172a").text(ageGen, 120, startY + 16);

    doc.fillColor("#475569").text("Appointment ID:", 320, startY + 16);
    doc.fillColor("#0f172a").text(prescription.appointmentId, 390, startY + 16);
    doc.moveDown(2.5);

    // 3. Clinical Assessment
    doc.fillColor("#065f46").fontSize(10).text("CLINICAL ASSESSMENT", 50, doc.y);
    doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
    doc.moveDown(1);

    const startAssessY = doc.y;
    doc.fillColor("#1e293b").fontSize(9).text("Chief Complaint & Symptoms:", 50, startAssessY);
    doc.fillColor("#475569").fontSize(8.5).text(`${prescription.consultation.chiefComplaint}. ${prescription.consultation.symptoms}`, 50, startAssessY + 14, { width: 230 });

    doc.fillColor("#1e293b").fontSize(9).text("Diagnosis (Roga Pariksha):", 300, startAssessY);
    doc.fillColor("#475569").fontSize(8.5).text(prescription.consultation.diagnosis, 300, startAssessY + 14, { width: 230 });
    
    // Position pointer down past descriptions
    doc.y = Math.max(doc.y + 15, startAssessY + 60);
    doc.moveDown(2);

    // 4. Prescribed Formulations Table
    if (prescription.medicines.length > 0) {
      doc.fillColor("#065f46").fontSize(10).text("PRESCRIBED FORMULATIONS", 50, doc.y);
      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
      doc.moveDown(1);

      // Table headers
      const tableY = doc.y;
      doc.fillColor("#475569").fontSize(8.5).text("Remedy", 50, tableY);
      doc.text("Dosage", 220, tableY);
      doc.text("Frequency", 340, tableY);
      doc.text("Duration", 450, tableY);

      doc.strokeColor("#94a3b8").lineWidth(0.8).moveTo(50, tableY + 12).lineTo(545, tableY + 12).stroke();
      doc.moveDown(1);

      prescription.medicines.forEach((med: any) => {
        const rowY = doc.y;
        
        // Prevent running over bounds
        if (rowY > 670) {
          doc.addPage();
          doc.y = 50;
        }

        const currentY = doc.y;
        doc.fillColor("#0f172a").fontSize(9).text(med.medicineName, 50, currentY);
        if (med.instructions) {
          doc.fillColor("#64748b").fontSize(7.5).text(`Instructions: ${med.instructions}`, 50, currentY + 12, { width: 160 });
        }
        
        doc.fillColor("#334155").fontSize(8.5).text(med.dosage, 220, currentY);
        doc.text(med.frequency, 340, currentY);
        doc.text(med.duration, 450, currentY);
        
        doc.y = Math.max(doc.y + 15, currentY + (med.instructions ? 26 : 16));
      });
      doc.moveDown(2);
    }

    // 5. Lifestyle & Dietary Guidance
    if (prescription.generalAdvice || prescription.dietAdvice) {
      // Prevent running over bounds
      if (doc.y > 600) {
        doc.addPage();
        doc.y = 50;
      }

      doc.fillColor("#065f46").fontSize(10).text("LIFESTYLE & DIETARY GUIDANCE", 50, doc.y);
      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
      doc.moveDown(1);

      const adviceY = doc.y;
      let leftHeight = 0;
      let rightHeight = 0;

      if (prescription.generalAdvice) {
        doc.fillColor("#065f46").fontSize(9).text("General Advice (Vihara)", 50, adviceY);
        doc.fillColor("#475569").fontSize(8.5).text(prescription.generalAdvice, 50, adviceY + 14, { width: 230 });
        leftHeight = doc.y - adviceY;
      }

      if (prescription.dietAdvice) {
        doc.fillColor("#065f46").fontSize(9).text("Dietary Advice (Pathya/Apathya)", 300, adviceY);
        doc.fillColor("#475569").fontSize(8.5).text(prescription.dietAdvice, 300, adviceY + 14, { width: 230 });
        rightHeight = doc.y - adviceY;
      }
      
      doc.y = adviceY + Math.max(leftHeight, rightHeight, 40);
      doc.moveDown(2);
    }

    // 6. Follow Up Date
    if (prescription.followUpDate) {
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 50;
      }

      const followUpStr = new Date(prescription.followUpDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.fillColor("#475569").fontSize(9).text("Follow-up Date: ", 50, doc.y);
      doc.fillColor("#064e3b").text(followUpStr, 130, doc.y - 12);
      doc.moveDown(1);
    }

    // Footer bottom notice
    doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(50, 725).lineTo(545, 725).stroke();
    doc.fillColor("#94a3b8").fontSize(7.5).text("This is a digitally generated Ayurvedic prescription. No signature required.", 50, 735, { align: "center" });

    doc.end();
  });
}
