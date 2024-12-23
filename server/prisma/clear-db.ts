import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.subscription.deleteMany({})
  await prisma.plan.deleteMany({})
  await prisma.user.deleteMany({})
}

main()
  .then(async () => {
    console.log('Database cleaned successfully')
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
