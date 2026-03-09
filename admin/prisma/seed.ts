import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('SmartPost#2026', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartpost.mx' },
    update: {},
    create: {
      email: 'admin@smartpost.mx',
      name: 'Admin SmartPost',
      password: passwordHash,
      subscriptionStatus: 'active',
      plan: 'pro',
    },
  })

  console.log('Admin creado:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
