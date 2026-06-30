const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL ERROR: Cannot run development reset utility in production mode.");
    process.exit(1);
  }

  console.log("Starting Development Database Reset...");

  try {
    // 1. Delete all prescription medicines
    const medicineRes = await prisma.prescriptionMedicine.deleteMany({});
    console.log(`- Deleted ${medicineRes.count} prescription medicines.`);

    // 2. Delete all prescriptions
    const prescriptionRes = await prisma.prescription.deleteMany({});
    console.log(`- Deleted ${prescriptionRes.count} prescriptions.`);

    // 3. Delete all consultations
    const consultationRes = await prisma.consultation.deleteMany({});
    console.log(`- Deleted ${consultationRes.count} consultations.`);

    // 4. Delete all payments
    const paymentRes = await prisma.payment.deleteMany({});
    console.log(`- Deleted ${paymentRes.count} payments.`);

    // 5. Delete all appointments
    const appointmentRes = await prisma.appointment.deleteMany({});
    console.log(`- Deleted ${appointmentRes.count} appointments.`);

    // 6. Delete all notification logs
    const notificationRes = await prisma.notificationLog.deleteMany({});
    console.log(`- Deleted ${notificationRes.count} notification logs.`);

    // 7. Delete all users who are not DOCTOR role
    const patientRes = await prisma.user.deleteMany({
      where: {
        role: {
          not: "DOCTOR"
        }
      }
    });
    console.log(`- Deleted ${patientRes.count} patient accounts.`);

    console.log("\nPreserved:");
    console.log("- Doctor accounts and profiles");
    console.log("- Availability schedule configurations");
    console.log("- System-level clinic settings");

    console.log("\nDevelopment database reset completed successfully!");
  } catch (err) {
    console.error("Error performing database reset:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
