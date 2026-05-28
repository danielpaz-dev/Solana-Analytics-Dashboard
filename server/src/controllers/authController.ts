// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';

export const AuthController = {
  register: async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create(email, passwordHash);

    // 🚀 GENERAMOS EL TOKEN PARA EL AUTO-LOGIN
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '2h' }
    );

    // 💡 Enviamos el token junto con el usuario
    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ 
      message: 'Internal server error during registration',
      error: error instanceof Error ? error.message : error 
    });
  }
},

  // Login method
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      // Find user in PostgreSQL
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Use generic message for security (prevents user enumeration)
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Check if password matches the hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JSON Web Token (JWT)
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '2h' } // Token expires automatically in 2 hours
      );

      // Respond with access token
      res.status(200).json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('[Login Error]:', error);
      res.status(500).json({ 
        message: 'Internal server error during login',
        error: error instanceof Error ? error.message : error 
      });
    }
  }
};