import express from 'express';
import { Lead } from '../models/lead.js';

export const leadRoutes = express.Router();

// Get all leads
leadRoutes.get('/', (req, res) => {
  try {
    const leads = Lead.getAll();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lead by ID
leadRoutes.get('/:id', (req, res) => {
  try {
    const lead = Lead.getById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new lead
leadRoutes.post('/', (req, res) => {
  try {
    const { name, email, phone, company, source, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const lead = Lead.create({
      name,
      email,
      phone,
      company,
      source,
      notes
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead
leadRoutes.put('/:id', (req, res) => {
  try {
    const lead = Lead.update(req.params.id, req.body);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lead
leadRoutes.delete('/:id', (req, res) => {
  try {
    const deleted = Lead.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leads by status
leadRoutes.get('/status/:status', (req, res) => {
  try {
    const leads = Lead.getByStatus(req.params.status);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});