import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
let leads = [];

export class Lead {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.company = data.company;
    this.status = data.status || 'new';
    this.source = data.source;
    this.notes = data.notes || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  static getAll() {
    return leads;
  }

  static getById(id) {
    return leads.find(lead => lead.id === id);
  }

  static create(data) {
    const lead = new Lead(data);
    leads.push(lead);
    return lead;
  }

  static update(id, data) {
    const index = leads.findIndex(lead => lead.id === id);
    if (index === -1) return null;
    
    leads[index] = { ...leads[index], ...data, updated_at: new Date().toISOString() };
    return leads[index];
  }

  static delete(id) {
    const index = leads.findIndex(lead => lead.id === id);
    if (index === -1) return false;
    
    leads.splice(index, 1);
    return true;
  }

  static getByStatus(status) {
    return leads.filter(lead => lead.status === status);
  }
}