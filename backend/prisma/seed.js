import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stockmaster.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@stockmaster.com',
      password: hashedPassword,
      role: 'INVENTORY_MANAGER'
    }
  })

  console.log('✅ Created admin user:')
  console.log('   Email: admin@stockmaster.com')
  console.log('   Password: admin123')
  console.log('   Role: INVENTORY_MANAGER')

  // Create default warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { name: 'Main Warehouse' },
    update: {},
    create: {
      name: 'Main Warehouse',
      address: '123 Main Street, City, Country',
      description: 'Primary warehouse location'
    }
  })

  console.log('✅ Created default warehouse: Main Warehouse')

  // Create default categories
  const categories = [
    { name: 'Electronics', description: 'Electronic products and components' },
    { name: 'Clothing', description: 'Apparel and textiles' },
    { name: 'Food & Beverages', description: 'Food items and drinks' },
    { name: 'Office Supplies', description: 'Office equipment and supplies' },
    { name: 'Tools & Hardware', description: 'Tools and hardware items' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('✅ Created default categories')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📝 Login Credentials:')
  console.log('   Email: admin@stockmaster.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


