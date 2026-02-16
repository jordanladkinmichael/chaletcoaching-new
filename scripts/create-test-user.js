// Load environment variables
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "test@gmail.com";
  const password = "123!";
  const tokens = 10_000_000;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, tokens: true },
    });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating tokens...`);
      
      // Hash password
      const hash = await bcrypt.hash(password, 10);
      
      // Check if topup transaction already exists
      const existingTopup = await prisma.transaction.findFirst({
        where: {
          userId: existingUser.id,
          type: "topup",
          amount: tokens,
          meta: { contains: "test-user-setup" },
        },
      });
      
      if (!existingTopup) {
        // Create topup transaction and update user tokens atomically
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              userId: existingUser.id,
              type: "topup",
              amount: tokens,
              meta: JSON.stringify({ reason: "test-user-setup", createdAt: new Date().toISOString() }),
            },
          }),
          prisma.user.update({
            where: { id: existingUser.id },
            data: {
              password: hash,
              tokens: tokens,
            },
          }),
        ]);
      } else {
        // Just update password and tokens
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hash,
            tokens: tokens,
          },
        });
      }
      
      console.log(`✓ User ${email} updated successfully!`);
      console.log(`  - Password: ${password}`);
      console.log(`  - Tokens: ${tokens.toLocaleString()}`);
    } else {
      console.log(`Creating new user ${email}...`);
      
      // Hash password
      const hash = await bcrypt.hash(password, 10);
      
      // Create user and topup transaction atomically
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hash,
          tokens: tokens,
        },
      });
      
      // Create topup transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "topup",
          amount: tokens,
          meta: JSON.stringify({ reason: "test-user-setup", createdAt: new Date().toISOString() }),
        },
      });
      
      console.log(`✓ User ${email} created successfully!`);
      console.log(`  - User ID: ${user.id}`);
      console.log(`  - Password: ${password}`);
      console.log(`  - Tokens: ${tokens.toLocaleString()}`);
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("\n✓ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Script failed:", error);
    process.exit(1);
  });
