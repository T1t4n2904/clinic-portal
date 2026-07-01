const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    // 1. Delete any existing user with phone "9999999999" to avoid unique constraint issues
    const existingTarget = await prisma.user.findUnique({
      where: { phone: "9999999999" }
    });

    if (existingTarget) {
      console.log(`Found existing user with phone 9999999999 (ID: ${existingTarget.id}). Deleting to resolve constraint...`);
      await prisma.user.delete({
        where: { id: existingTarget.id }
      });
      console.log("Deleted duplicate user successfully.");
    }

    // 2. Now perform the update for the patient
    const userToUpdate = await prisma.user.findUnique({
      where: { phone: "8287645396" }
    });

    if (userToUpdate) {
      const updated = await prisma.user.update({
        where: { phone: "8287645396" },
        data: { phone: "9999999999" }
      });
      console.log(`Updated patient user ID ${updated.id} phone number to: ${updated.phone}`);
    } else {
      console.log("No patient account found with phone 8287645396.");
    }
  } catch (err) {
    console.error("Error resolving phone conflict:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
