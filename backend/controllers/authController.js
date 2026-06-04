const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    
    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { username: adminUser, role: 'admin' },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '2h' }
    );
    
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
