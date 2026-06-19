import 'dotenv/config';
import connectDB from './config/db.js';
import Table from './models/Table.js';
import MenuItem from './models/MenuItem.js';
import { generateTableQR } from './services/qrService.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const menuItems = [
  {
    name: 'Crispy Spring Rolls',
    description: 'Vegetable spring rolls with sweet chili dip',
    price: 180,
    category: 'starters',
    prepTimeMinutes: 10,
  },
  {
    name: 'Chicken Tikka',
    description: 'Marinated chicken grilled in tandoor',
    price: 320,
    category: 'starters',
    prepTimeMinutes: 15,
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese in rich tomato gravy',
    price: 280,
    category: 'mains',
    prepTimeMinutes: 20,
  },
  {
    name: 'Butter Chicken',
    description: 'Classic creamy tomato-based curry',
    price: 350,
    category: 'mains',
    prepTimeMinutes: 25,
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with mixed vegetables',
    price: 260,
    category: 'mains',
    prepTimeMinutes: 20,
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy crepe with spiced potato filling',
    price: 150,
    category: 'mains',
    prepTimeMinutes: 15,
  },
  {
    name: 'Gulab Jamun',
    description: 'Warm milk dumplings in sugar syrup',
    price: 120,
    category: 'desserts',
    prepTimeMinutes: 5,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Served with vanilla ice cream',
    price: 180,
    category: 'desserts',
    prepTimeMinutes: 5,
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Sweet or salted',
    price: 80,
    category: 'beverages',
    prepTimeMinutes: 3,
  },
  {
    name: 'Mango Lassi',
    description: 'Thick yogurt drink with mango pulp',
    price: 100,
    category: 'beverages',
    prepTimeMinutes: 5,
  },
  {
    name: "Chef's Special Thali",
    description: 'Complete meal with roti, rice, dal, and dessert',
    price: 450,
    category: 'specials',
    prepTimeMinutes: 30,
  },
];

const seed = async () => {
  await connectDB();

  await MenuItem.deleteMany({});
  await Table.deleteMany({});

  await MenuItem.insertMany(menuItems);
  console.log(`Seeded ${menuItems.length} menu items`);

  for (let i = 1; i <= 8; i++) {
    const qrCode = await generateTableQR(i, clientUrl);
    await Table.create({ number: i, capacity: 4, qrCode });
    console.log(`Created table ${i}`);
  }

  console.log('Seed completed');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
