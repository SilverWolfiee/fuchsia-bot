import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/users.json');

/**
 
 * @returns {Object} 
 */
export const loadUsers = () => {
    try {
       
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
            return {};
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error loading users:", err);
        return {};
    }
};

/**
 * @param {string} userId
 * @param {Object} userData 
 */

export const saveUser = (userId, userData) => {
    try {
        const users = loadUsers();
        users[userId] = userData;
        fs.writeFileSync(filePath, JSON.stringify(users, null, 4));
    } catch (err) {
        console.error("Error saving user:", err);
    }
};