// === AUTHENTICATION SYSTEM ===
const AUTH = {
    init() {
        this.initDefaultAdmin();
        this.checkExpiredAccounts();
        this.showLoginScreen();
        this.setupEventListeners();
    },

    initDefaultAdmin() {
        const users = this.getUsers();
        if (!users.Edyhinz) {
            users.Edyhinz = {
                password: 'Edyhinz1245',
                role: 'admin',
                expiry: null
            };
            localStorage.setItem('compiler_users', JSON.stringify(users));
        }
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('compiler_users') || '{}');
    },

    saveUsers(users) {
        localStorage.setItem('compiler_users', JSON.stringify(users));
    },

    getCurrentUser() {
        return localStorage.getItem('compiler_current_user');
    },

    login(username, password) {
        const users = this.getUsers();
        const user = users[username];

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        if (user.expiry && new Date().getTime() > user.expiry) {
            delete users[username];
            this.saveUsers(users);
            return { success: false, message: 'Account has expired' };
        }

        localStorage.setItem('compiler_current_user', username);
        localStorage.setItem('compiler_user_role', user.role);
        return { success: true };
    },

    logout() {
        localStorage.removeItem('compiler_current_user');
        localStorage.removeItem('compiler_user_role');
        this.showLoginScreen();
    },

    createAccount(username, password, days, hours, minutes) {
        const users = this.getUsers();

        if (users[username]) {
            return { success: false, message: 'Username already exists' };
        }

        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }

        const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
        const expiry = totalMinutes > 0 ? new Date().getTime() + (totalMinutes * 60 * 1000) : null;

        users[username] = {
            password,
            role: 'user',
            expiry
        };

        this.saveUsers(users);
        return { success: true, message: 'Account created successfully' };
    },

    deleteAccount(username) {
        if (username === 'Edyhinz') {
            return { success: false, message: 'Cannot delete admin account' };
        }

        const users = this.getUsers();
        delete users[username];
        this.saveUsers(users);
        return { success: true };
    },

    checkExpiredAccounts() {
        const users = this.getUsers();
        const now = new Date().getTime();
        let hasChanges = false;

        for (const [username, user] of Object.entries(users)) {
            if (user.expiry && now > user.expiry) {
                delete users[username];
                hasChanges = true;
            }
        }

        if (hasChanges) {
            this.saveUsers(users);
        }
    },

    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('compilerScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
    },

    showCompilerScreen() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('compilerScreen').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');

        const username = this.getCurrentUser();
        const role = localStorage.getItem('compiler_user_role');

        document.getElementById('currentUser').textContent = `👤 ${username}`;

        if (role === 'admin') {
            document.getElementById('adminPanelBtn').classList.remove('hidden');
        }
    },

    showAdminPanel() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('compilerScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        this.loadAccountsList();
    },

    loadAccountsList() {
        const users = this.getUsers();
        const accountsList = document.getElementById('accountsList');
        accountsList.innerHTML = '';

        for (const [username, user] of Object.entries(users)) {
            const item = document.createElement('div');
            item.className = 'account-item';

            let expiryText = 'Never expires';
            if (user.expiry) {
                const remaining = user.expiry - new Date().getTime();
                const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
                const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                expiryText = `Expires in: ${days}d ${hours}h ${minutes}m`;
            }

            const roleIcon = user.role === 'admin' ? '👑' : '👤';

            item.innerHTML = `
                <div class="account-info">
                    <h3>${roleIcon} ${username}</h3>
                    <p>${expiryText}</p>
                </div>
                <div class="account-actions">
                    ${username !== 'Edyhinz' ? `<button onclick="AUTH.deleteAccount('${username}'); AUTH.loadAccountsList();">Delete</button>` : ''}
                </div>
            `;

            accountsList.appendChild(item);
        }
    },

    setupEventListeners() {
        // Login
        document.getElementById('loginBtn').addEventListener('click', () => {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const result = this.login(username, password);

            if (result.success) {
                this.showCompilerScreen();
            } else {
                const errorEl = document.getElementById('loginError');
                errorEl.textContent = result.message;
                errorEl.classList.remove('hidden');
            }
        });

        // Login on Enter key
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('loginBtn').click();
            }
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Show Admin Panel
        document.getElementById('adminPanelBtn').addEventListener('click', () => {
            this.showAdminPanel();
        });

        // Back to Compiler
        document.getElementById('backToCompilerBtn').addEventListener('click', () => {
            this.showCompilerScreen();
        });

        // Create Account
        document.getElementById('createAccountBtn').addEventListener('click', () => {
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value;
            const days = parseInt(document.getElementById('expiryDays').value) || 0;
            const hours = parseInt(document.getElementById('expiryHours').value) || 0;
            const minutes = parseInt(document.getElementById('expiryMinutes').value) || 0;

            const result = this.createAccount(username, password, days, hours, minutes);
            const statusEl = document.getElementById('createAccountStatus');

            statusEl.textContent = result.message;
            statusEl.className = result.success ? 'status-message success' : 'status-message error';
            statusEl.classList.remove('hidden');

            if (result.success) {
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('expiryDays').value = 0;
                document.getElementById('expiryHours').value = 0;
                document.getElementById('expiryMinutes').value = 0;
                this.loadAccountsList();

                setTimeout(() => {
                    statusEl.classList.add('hidden');
                }, 3000);
            }
        });
    }
};

// === COMPILER CODE ===
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication
    AUTH.init();

    // Original compiler code continues...
    const textarea = document.getElementById('luaCode');
    const lineNumbers = document.getElementById('lineNumbers');
    const compileBtn = document.getElementById('compileBtn');
    const fileInput = document.getElementById('fileInput');
    const clearBtn = document.getElementById('clearBtn');
    const statusMessage = document.getElementById('statusMessage');
    let currentFileName = 'compiled_secure.lua';

    const updateLineNumbers = () => {
        const lines = textarea.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    };

    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    });

    updateLineNumbers();

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentFileName = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                textarea.value = e.target.result;
                updateLineNumbers();
                showStatus('File loaded successfully!', 'success');
            };
            reader.readAsText(file);
        }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the editor?')) {
            textarea.value = '';
            updateLineNumbers();
            statusMessage.classList.add('hidden');
        }
    });

    const showStatus = (msg, type) => {
        statusMessage.textContent = msg;
        statusMessage.className = `status-message ${type}`;
        statusMessage.classList.remove('hidden');
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    };

    const generateRandomString = (length) => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const compileLocally = (sourceCode) => {
        const encodeString = (str) => {
            const bytes = [];
            for (let i = 0; i < str.length; i++) {
                bytes.push(str.charCodeAt(i));
            }
            return `string.char(${bytes.join(',')})`;
        };

        let obfuscatedCode = sourceCode.replace(/"([^"]*)"|'([^']*)'/g, (match, dq, sq) => {
            const str = dq || sq;
            if (str && str.length > 0) {
                return encodeString(str);
            }
            return match;
        });

        const varPattern = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const funcPattern = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;

        let matches;
        const identifiers = new Set();

        while ((matches = varPattern.exec(obfuscatedCode)) !== null) {
            identifiers.add(matches[1]);
        }

        while ((matches = funcPattern.exec(obfuscatedCode)) !== null) {
            identifiers.add(matches[1]);
        }

        const replacements = {};
        const reserved = ['true', 'false', 'nil', 'and', 'or', 'not', 'if', 'then', 'else',
            'elseif', 'end', 'for', 'while', 'do', 'repeat', 'until', 'function',
            'local', 'return', 'break', 'in', 'pairs', 'ipairs', 'print', 'client',
            'source', 'root', 'resourceRoot', 'math', 'string', 'table'];

        identifiers.forEach(name => {
            if (!reserved.includes(name)) {
                replacements[name] = '_' + generateRandomString(Math.floor(Math.random() * 4) + 3);
            }
        });

        for (const [oldName, newName] of Object.entries(replacements)) {
            // Don't rename if it's a table field access (after a dot)
            const regex = new RegExp('(?<![.])\\b' + oldName + '\\b(?![.])', 'g');
            obfuscatedCode = obfuscatedCode.replace(regex, newName);
        }

        const dummyCount = Math.floor(Math.random() * 5) + 3;
        let dummies = '';
        for (let i = 0; i < dummyCount; i++) {
            const dummyName = '_' + generateRandomString(4);
            const dummyValue = Math.floor(Math.random() * 1000);
            dummies += `${dummyName}=${dummyValue};`;
        }

        obfuscatedCode = dummies + obfuscatedCode;
        obfuscatedCode = obfuscatedCode.replace(/\blocal\s+/g, '');

        obfuscatedCode = obfuscatedCode
            .replace(/--\[\[[\s\S]*?\]\]/g, '')
            .replace(/--[^\n]*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([=+\-*/<>~,;:(){}[\]])\s*/g, '$1')
            .trim();

        // Generate garbage with code at random position
        const totalLines = 200;
        const codePosition = Math.floor(Math.random() * 40) + 80; // Random between 80-120

        let binaryHeader = "--[[";

        for (let line = 0; line < totalLines; line++) {
            const lineLength = Math.floor(Math.random() * 60) + 30;
            let lineContent = "";
            for (let i = 0; i < lineLength; i++) {
                let c;
                do {
                    c = Math.floor(Math.random() * (126 - 33 + 1)) + 33;
                } while (c === 91 || c === 93);
                lineContent += String.fromCharCode(c);
            }
            binaryHeader += lineContent + "\n";

            // Inject code at random position
            if (line === codePosition) {
                binaryHeader += "]] " + obfuscatedCode + " --[[\n";
            }
        }

        binaryHeader += "]]";

        return binaryHeader;
    };

    compileBtn.addEventListener('click', () => {
        const code = textarea.value.trim();
        if (!code) {
            showStatus('Please enter some Lua code first.', 'error');
            return;
        }

        compileBtn.classList.add('loading');
        compileBtn.disabled = true;
        statusMessage.classList.add('hidden');

        setTimeout(() => {
            try {
                const compiledCode = compileLocally(code);

                const blob = new Blob([compiledCode], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                let downloadName = currentFileName;
                if (downloadName.endsWith('.lua')) {
                    downloadName = downloadName.substring(0, downloadName.length - 4);
                }
                if (!downloadName.endsWith('.luac')) {
                    downloadName += '.luac';
                }
                a.download = downloadName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                showStatus('Code successfully obfuscated and generated!', 'success');
            } catch (error) {
                console.error(error);
                showStatus('An error occurred during local compilation.', 'error');
            } finally {
                compileBtn.classList.remove('loading');
                compileBtn.disabled = false;
            }
        }, 1500);
    });
});
