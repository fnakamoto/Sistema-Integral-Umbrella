import express from 'express';
import { Lead } from '../models/lead.js';

export const automationRoutes = express.Router();

// Simple automation rules
const automationRules = [
  {
    id: 'email-follow-up',
    name: 'Email Follow-up',
    trigger: 'lead_created',
    action: 'send_email',
    delay: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  },
  {
    id: 'status-update',
    name: 'Auto Status Update',
    trigger: 'no_activity',
    action: 'update_status',
    delay: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
];

// Get all automation rules
automationRoutes.get('/rules', (req, res) => {
  try {
    res.json(automationRules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger automation for a lead
automationRoutes.post('/trigger/:leadId', (req, res) => {
  try {
    const { leadId } = req.params;
    const { ruleId } = req.body;

    const lead = Lead.getById(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }

    // Simulate automation execution
    console.log(`Executing automation rule "${rule.name}" for lead ${lead.name}`);
    
    // For demo purposes, we'll just log the action
    switch (rule.action) {
      case 'send_email':
        console.log(`Sending follow-up email to ${lead.email}`);
        break;
      case 'update_status':
        Lead.update(leadId, { status: 'contacted' });
        console.log(`Updated lead status to 'contacted'`);
        break;
      default:
        console.log(`Unknown action: ${rule.action}`);
    }

    res.json({ 
      message: `Automation rule "${rule.name}" executed successfully`,
      lead: Lead.getById(leadId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get automation history (mock data)
automationRoutes.get('/history/:leadId', (req, res) => {
  try {
    const { leadId } = req.params;
    
    const lead = Lead.getById(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Mock automation history
    const history = [
      {
        id: '1',
        ruleId: 'email-follow-up',
        ruleName: 'Email Follow-up',
        executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ];

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});