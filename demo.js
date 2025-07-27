#!/usr/bin/env node

/**
 * Premium Themes Demo Script
 * 
 * This script demonstrates the premium themes functionality by:
 * 1. Starting the server
 * 2. Creating test users
 * 3. Adding coins to users
 * 4. Testing theme purchases
 * 5. Showing theme status and statistics
 */

const http = require('http');

// Server URL
const BASE_URL = 'http://localhost:3000';

// Test users
const TEST_USERS = [
  { id: 'demo_user1', name: 'Alice' },
  { id: 'demo_user2', name: 'Bob' },
  { id: 'demo_user3', name: 'Charlie' }
];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(`${BASE_URL}${path}`, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Demo functions
async function createTestUser(userId) {
  console.log(`\n📝 Creating test user: ${userId}`);
  
  // Create user by making a rating (this creates user if doesn't exist)
  const result = await makeRequest('POST', '/rate', {
    userId,
    rating: 'heart',
    chatDuration: 300
  });
  
  if (result.status === 200) {
    console.log(`✅ User ${userId} created with initial XP: ${result.data.xpGained}`);
  } else {
    console.log(`✅ User ${userId} already exists`);
  }
}

async function addCoinsToUser(userId, amount) {
  console.log(`💰 Adding ${amount} coins to ${userId}`);
  
  const result = await makeRequest('POST', '/api/user/coins/add', {
    userId,
    amount
  });
  
  if (result.status === 200) {
    console.log(`✅ Added ${amount} coins. New balance: ${result.data.newBalance}`);
  } else {
    console.log(`❌ Failed to add coins: ${result.data.error}`);
  }
}

async function showAllThemes() {
  console.log('\n🎨 Available Themes:');
  
  const result = await makeRequest('GET', '/api/themes');
  
  if (result.status === 200) {
    const themes = result.data.themes;
    
    const freeThemes = themes.filter(t => !t.is_premium);
    const premiumThemes = themes.filter(t => t.is_premium);
    
    console.log('\n📚 FREE THEMES:');
    freeThemes.forEach(theme => {
      console.log(`  ${theme.icon} ${theme.name} - ${theme.description}`);
    });
    
    console.log('\n💎 PREMIUM THEMES:');
    premiumThemes.forEach(theme => {
      console.log(`  ${theme.icon} ${theme.name} (${theme.price} AnonCoins) - ${theme.description}`);
    });
    
    console.log(`\nTotal: ${freeThemes.length} free, ${premiumThemes.length} premium themes`);
  } else {
    console.log(`❌ Failed to get themes: ${result.data.error}`);
  }
}

async function purchaseTheme(userId, themeId) {
  console.log(`\n🛒 ${userId} purchasing theme: ${themeId}`);
  
  const result = await makeRequest('POST', '/api/themes/purchase', {
    userId,
    themeId
  });
  
  if (result.status === 200) {
    console.log(`✅ Successfully purchased ${result.data.theme.name}!`);
    console.log(`   💰 Coins spent: ${result.data.coinsSpent}`);
    console.log(`   💰 Remaining balance: ${result.data.remainingCoins}`);
  } else {
    console.log(`❌ Purchase failed: ${result.data.error}`);
  }
}

async function showUserStatus(userId) {
  console.log(`\n👤 ${userId} Status:`);
  
  const result = await makeRequest('GET', `/api/themes/status/${userId}`);
  
  if (result.status === 200) {
    const data = result.data;
    console.log(`   💰 Coins: ${data.userCoins}`);
    console.log(`   🎨 Owned themes: ${data.totalPurchases}/${data.availablePremiumThemes + 2} (including free)`);
    console.log(`   🔓 Purchased themes: ${data.purchasedThemes.join(', ') || 'None'}`);
  } else {
    console.log(`❌ Failed to get user status: ${result.data.error}`);
  }
}

async function showSystemStats() {
  console.log('\n📊 System Statistics:');
  
  const result = await makeRequest('GET', '/api/admin/themes/stats');
  
  if (result.status === 200) {
    const stats = result.data;
    console.log(`   🎨 Total themes: ${stats.totalThemes}`);
    console.log(`   📚 Free themes: ${stats.freeThemes}`);
    console.log(`   💎 Premium themes: ${stats.premiumThemes}`);
    console.log(`   🛒 Total purchases: ${stats.totalPurchases}`);
    console.log(`   💰 Total revenue: ${stats.revenue} AnonCoins`);
  } else {
    console.log(`❌ Failed to get system stats: ${result.data.error}`);
  }
}

// Main demo function
async function runDemo() {
  console.log('🚀 Premium Themes Demo Starting...');
  console.log('====================================');
  
  try {
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show all available themes
    await showAllThemes();
    
    // Create test users
    for (const user of TEST_USERS) {
      await createTestUser(user.id);
    }
    
    // Add coins to users
    await addCoinsToUser('demo_user1', 1000); // Rich user
    await addCoinsToUser('demo_user2', 200);  // Moderate user
    await addCoinsToUser('demo_user3', 50);   // Poor user
    
    // Show initial user statuses
    console.log('\n📋 Initial User Statuses:');
    for (const user of TEST_USERS) {
      await showUserStatus(user.id);
    }
    
    // Test purchases
    console.log('\n🛒 Testing Theme Purchases:');
    await purchaseTheme('demo_user1', 'pixelquest');
    await purchaseTheme('demo_user1', 'hellokitty');
    await purchaseTheme('demo_user1', 'digitalvoid');
    
    await purchaseTheme('demo_user2', 'chill');
    await purchaseTheme('demo_user2', 'retroneon'); // Should fail - insufficient coins
    
    await purchaseTheme('demo_user3', 'pixelquest'); // Should fail - insufficient coins
    
    // Show final user statuses
    console.log('\n📋 Final User Statuses:');
    for (const user of TEST_USERS) {
      await showUserStatus(user.id);
    }
    
    // Show system statistics
    await showSystemStats();
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('====================================');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Check if this script is run directly
if (require.main === module) {
  // Check if server is running
  makeRequest('GET', '/api/themes')
    .then(() => {
      console.log('✅ Server is running, starting demo...');
      runDemo();
    })
    .catch(() => {
      console.log('❌ Server is not running. Please start the server first with "npm start"');
      process.exit(1);
    });
}

module.exports = { runDemo, makeRequest };