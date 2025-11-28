# 🔐 MTA:SA Secure Lua Compiler

A professional web-based Lua obfuscator with user authentication and time-limited accounts.

## 🎯 Authentication System

### Default Admin Account
- **Username:** `Edyhinz`
- **Password:** `Edyhinz1245`
- **Role:** Admin (Cannot be deleted)

### Features
- ✅ Secure login system
- ✅ Admin panel for user management
- ✅ Time-limited accounts (days/hours/minutes)
- ✅ Automatic account expiration
- ✅ Role-based access control

## 📖 How to Use

### 1. Login
1. Open `index.html` in your browser
2. Enter your username and password
3. Click "Login"

### 2. Admin Panel (Admin Only)
1. Login with admin credentials
2. Click "Admin Panel" button
3. Create new accounts with:
   - Custom username
   - Custom password
   - Expiration time (days, hours, minutes)
4. View all existing accounts
5. Delete user accounts (admin cannot be deleted)

### 3. Compile Lua Code
1. Paste your Lua code in the editor
2. Click "Encrypt & Generate"
3. Download the obfuscated `.luac` file

## 🔧 Obfuscation Features

- **String Encoding:** All strings converted to `string.char()`
- **Variable Renaming:** Random variable names
- **No Local Keywords:** Variables become global
- **Dummy Variables:** Random fake variables
- **Code Camouflage:** Code hidden in random position (lines 80-120)
- **200 Lines of Garbage:** ASCII junk for obfuscation
- **Field Access Protection:** Table fields not renamed
- **Server-Side Compatible:** No loadstring/load required

## 💾 Data Storage

All user data is stored in `localStorage`:
- `compiler_users`: User accounts database
- `compiler_current_user`: Current logged-in user
- `compiler_user_role`: User role (admin/user)

## ⚙️ Account Management

### Creating Accounts
- Admin can create unlimited accounts
- Each account can have custom expiration
- Example: 20 days, 5 hours, 30 minutes

### Account Expiration
- Accounts auto-delete when expired
- Admin account never expires
- Expired accounts cannot login

## 🚀 Tech Stack

- HTML5
- CSS3 (Modern glassmorphism design)
- Vanilla JavaScript
- LocalStorage for data persistence

## 📋 Example Usage

### Creating a User
1. Login as admin
2. Go to Admin Panel
3. Enter:
   - Username: `def`
   - Password: `1234`
   - Days: `20`
4. Click "Create Account"

### Compiling Code
1. Login with any account
2. Paste Lua code
3. Click "Encrypt & Generate"
4. Use downloaded file in MTA:SA

---

**Created by Edyhinz** | Private Use Only
