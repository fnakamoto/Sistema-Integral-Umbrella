import express from 'express';
import { User } from '../models/user.js';

export const userRoutes = express.Router();

// Get all users
userRoutes.get('/', (req, res) => {
  try {
    const users = User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
userRoutes.get('/:id', (req, res) => {
  try {
    const user = User.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
userRoutes.post('/', (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Check if username already exists
    const existingUser = User.getByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = User.create({
      username,
      email,
      role
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
userRoutes.put('/:id', (req, res) => {
  try {
    const user = User.update(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
userRoutes.delete('/:id', (req, res) => {
  try {
    const deleted = User.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});