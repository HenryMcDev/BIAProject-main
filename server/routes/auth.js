import express from 'express';
// Assumes you have a db connection pool exported from a db config file
import pool from '../config/db.js';

const router = express.Router();

router.post('/api/validate-access', async (req, res) => {
  try {
    // 1. Extract 'cpf' and 'role' from req.body.
    const { cpf, role } = req.body;

    if (!cpf || !role) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'CPF and role are required.' 
      });
    }

    // 2. Query the MySQL database using a prepared statement
    const [rows] = await pool.execute('SELECT role FROM users WHERE cpf = ?', [cpf]);

    // 3. Compare roles and return appropriate response
    if (rows.length === 0) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Identity or role mismatch.' 
      });
    }

    const dbRole = rows[0].role;

    if (dbRole === 'desenvolvedor') {
      return res.status(200).json({ 
        status: 'success', 
        accessLevel: 'admin', 
        permissions: 'all', 
        message: 'Full unrestricted access granted.' 
      });
    } else if (dbRole === role) {
      return res.status(200).json({ 
        status: 'success', 
        accessLevel: 'user', 
        permissions: ['chat', 'library'], 
        message: 'Restricted access granted based on your role.' 
      });
    } else {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Identity or role mismatch.' 
      });
    }
  } catch (error) {
    // 4. Professional error handling
    console.error('Error validating access:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error while validating access.' 
    });
  }
});

export default router;
