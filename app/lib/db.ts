// import { PrismaClient } from '@prisma/client'
// import { Pool } from 'pg'
// import { PrismaPg } from '@prisma/adapter-pg'

// declare global {
//   var prisma: PrismaClient | undefined
// }

// const connectionString = process.env.DATABASE_URL

// if (!connectionString) {
//   throw new Error('DATABASE_URL is not defined')
// }

// let prisma: PrismaClient

// if (process.env.NODE_ENV === 'production') {
//   const pool = new Pool({ connectionString })
//   const adapter = new PrismaPg(pool)
//   prisma = new PrismaClient({ adapter })
// } else {
//   if (!global.prisma) {
//     const pool = new Pool({ connectionString })
//     const adapter = new PrismaPg(pool)
//     global.prisma = new PrismaClient({
//       adapter,
//       log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
//     })
//   }
//   prisma = global.prisma
// }

// export { prisma }