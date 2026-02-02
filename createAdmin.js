// Create Admin User Script
// Open browser console and run this script to create your admin account

import { AuthService } from './src/services/authService.js';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    const result = await AuthService.createAdmin({
      email: 'siddiqshaik613@gmail.com',
      password: 'Si@260805',
      name: 'Siddiq Shaik - Admin'
    });
    console.log('✅ Admin user created successfully!');
    console.log('Email:', result.userData.email);
    console.log('Role:', result.userData.role);
    console.log('Name:', result.userData.name);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Run the function
createAdminUser();