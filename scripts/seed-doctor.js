const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DOCTOR_EMAIL || "doctor@clinic.local";
  const phone = process.env.DOCTOR_PHONE || "9999999999";
  const password = process.env.DOCTOR_PASSWORD || "Doctor@12345";
  const fullName = process.env.DOCTOR_NAME || "Demo Doctor";
  const passwordHash = await bcrypt.hash(password, 10);

  const existingDoctor = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  const doctor = existingDoctor
    ? await prisma.user.update({
        where: { id: existingDoctor.id },
        data: {
          fullName,
          email,
          phone,
          passwordHash,
          role: "DOCTOR",
          phoneVerified: true,
        },
      })
    : await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          passwordHash,
          role: "DOCTOR",
          phoneVerified: true,
        },
      });

  console.log(`Doctor account ready: ${doctor.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
