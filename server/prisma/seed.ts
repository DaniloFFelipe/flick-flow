import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const basePlans: Prisma.PlanUncheckedCreateInput[] = [
    { name: 'Free', price_in_cents: 0, max_content_length: 10 },
    {
      name: 'Basic',
      price_in_cents: 1000,
      max_content_length: 100,
    },
    {
      name: 'Premium',
      price_in_cents: 2000,
      max_content_length: 500,
    },
  ]

  await prisma.plan.createMany({
    data: basePlans,
  })
}

main()
  .then(async () => {
    console.log('Database seeded successfully')
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
