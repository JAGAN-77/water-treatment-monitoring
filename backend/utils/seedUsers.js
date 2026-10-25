const User = require('../models/User');

/**
 * Safely seeds default initial accounts for each role if they don't already exist.
 * Preserves existing users and avoids destructive database resets.
 */
const seedDefaultUsers = async () => {
  try {
    const defaultAccounts = [
      {
        name: 'Chief Admin',
        email: 'admin@watertreatment.com',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123',
        role: 'Admin',
        shift: 'A',
        isActive: true
      },
      {
        name: 'Operator 1',
        email: 'operator@watertreatment.com',
        password: process.env.INITIAL_OPERATOR_PASSWORD || 'Operator@123',
        role: 'Plant Operator',
        shift: 'A',
        isActive: true
      },
      {
        name: 'Analyst Jane',
        email: 'analyst@watertreatment.com',
        password: process.env.INITIAL_ANALYST_PASSWORD || 'Analyst@123',
        role: 'Monitoring Analyst',
        shift: 'B',
        isActive: true
      }
    ];

    for (const acc of defaultAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
        console.log(`[Seed] Created default ${acc.role} account: ${acc.email}`);
      }
    }
  } catch (err) {
    console.error('[Seed] Error during default account check:', err.message);
  }
};

module.exports = seedDefaultUsers;
