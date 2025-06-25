import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
let users = [];

export class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.role = data.role || 'user';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  static getAll() {
    return users;
  }

  static getById(id) {
    return users.find(user => user.id === id);
  }

  static getByUsername(username) {
    return users.find(user => user.username === username);
  }

  static create(data) {
    const user = new User(data);
    users.push(user);
    return user;
  }

  static update(id, data) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...data, updated_at: new Date().toISOString() };
    return users[index];
  }

  static delete(id) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    users.splice(index, 1);
    return true;
  }
}