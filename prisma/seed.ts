import "dotenv/config";
import { hashPassword } from "@/app/lib/auth";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Start seeding ...`);
  // Create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Engineering",
        description: "Team for developers",
        code: "ENG-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Design",
        description: "Team for designers",
        code: "DES-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Marketing",
        description: "Team for marketers",
        code: "MRK-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Sales",
        description: "Team for sales",
        code: "SL-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "HR",
        description: "Team for HR",
        code: "HR-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Legal",
        description: "Team for lawyers",
        code: "LGL-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "IT",
        description: "Team for IT",
        code: "IT-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Finance",
        description: "Team for finance",
        code: "FN-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Operations",
        description: "Team for operations",
        code: "OP-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Customer Support",
        description: "Team for customer support",
        code: "CS-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Quality Assurance",
        description: "Team for quality assurance",
        code: "QA-2026",
      },
    }),

    prisma.team.create({
      data: {
        name: "Product Management",
        description: "Team for product management",
        code: "PM-2026",
      },
    }),
  ]);

  // Create sample users

  const sampleUsers = [
    {
      name: "John Doe",
      email: "rGt0f@example.com",
      team: teams[0],
      role: Role.MANAGER,
    },
    {
      name: "Jane Doe",
      email: "rty@example.com",
      team: teams[1],
      role: Role.MANAGER,
    },
    {
      name: "Rohan Doe",
      email: "1wer@example.com",
      team: teams[2],
      role: Role.MANAGER,
    },
    {
      name: "Manager Doe",
      email: "m1@example.com",
      team: teams[3],
      role: Role.MANAGER,
    },
    {
      name: "Rahim Doe",
      email: "zLHbH@example.com",
      team: teams[3],
      role: Role.USER,
    },
    {
      name: "Rahima Doe",
      email: "k10@example.com",
      team: teams[1],
      role: Role.USER,
    },
    {
      name: "Kabila Doe",
      email: "uni@example.com",
      team: teams[3],
      role: Role.USER,
    },
    {
      name: "Rahima1 Doe",
      email: "k2@example.com",
      team: teams[0],
      role: Role.USER,
    },
    {
      name: "Rahima2 Doe",
      email: "k3@example.com",
      team: teams[1],
      role: Role.USER,
    },
    {
      name: "Rahima Doe",
      email: "k1@example.com",
      team: teams[1],
      role: Role.USER,
    },
    {
      name: "Kamla Doe",
      email: "k4@example.com",
      team: teams[2],
      role: Role.USER,
    },
    {
      name: "Kamla1 Doe",
      email: "k5@example.com",
      team: teams[3],
      role: Role.USER,
    },
    {
      name: "Kamla2 Doe",
      email: "k6@example.com",
      team: teams[3],
      role: Role.USER,
    },
    {
      name: "Kamla3 Doe",
      email: "k60@example.com",
      team: teams[0],
      role: Role.USER,
    },
  ];

  for (const user of sampleUsers) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.team.id,
        password: await hashPassword("123456"),
      },
    });
  }

  console.log(`Database has been seeded. 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
