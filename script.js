// === DISCORD OAUTH2 AUTHENTICATION ===
const AUTH = {
    init() {
        this.initAdmin();
        this.checkCallback();
        this.checkSession();
        this.setupEventListeners();
    },

    initAdmin() {
        const authorized = this.getAuthorized();
        if (!authorized[ADMIN_CONFIG.ADMIN_ID]) {
            authorized[ADMIN_CONFIG.ADMIN_ID] = {
                username: 'Admin',
                expiry: null,
                isAdmin: true
            };
            this.saveAuthorized(authorized);
        }
    },

    getAuthorized() {
        return JSON.parse(localStorage.getItem('authorized_users') || '{}');
    },

    saveAuthorized(users) {
        localStorage.setItem('authorized_users', JSON.stringify(users));
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('discord_user') || 'null');
    },

    saveCurrentUser(user) {
        localStorage.setItem('discord_user', JSON.stringify(user));
    },

    // Discord OAuth Flow (Implicit Grant - Client Side)
    loginWithDiscord() {
        const authUrl = `https://discord.com/oauth2/authorize?client_id=1443871922633965739&response_type=code&redirect_uri=https%3A%2F%2Fcompilercompany.netlify.app%2F&scope=identify`;
        window.location.href = authUrl;
    },

    async checkCallback() {
        // Check for token in URL hash (implicit grant)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('code');

        if (accessToken) {
            try {
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);

                // Get user info directly
                const userData = await this.getUserInfo(accessToken);

                // Save user data
                this.saveCurrentUser({
                    id: userData.id,
                    username: userData.username,
                    discriminator: userData.discriminator,
                    avatar: userData.avatar,
                    token: accessToken
                });

                // Check authorization
                this.checkSession();
            } catch (error) {
                console.error('OAuth error:', error);
                this.showLoginScreen();
                this.showError('Error al autenticar con Discord');
            }
        }
    },

    async getUserInfo(accessToken) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        return await response.json();
    },

    checkSession() {
        const user = this.getCurrentUser();

        if (!user) {
            this.showLoginScreen();
            return;
        }

        const authorized = this.getAuthorized();
        const userAuth = authorized[user.id];

        // Check if user is authorized
        if (!userAuth) {
            this.showUnauthorizedScreen(user);
            return;
        }

        // Check if expired
        if (userAuth.expiry && new Date().getTime() > userAuth.expiry) {
            delete authorized[user.id];
            this.saveAuthorized(authorized);
            this.logout();
            return;
        }

        // User is authorized
        this.showCompilerScreen(user, userAuth.isAdmin);
    },

    showError(message) {
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    },

    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('unauthorizedScreen').classList.add('hidden');
        document.getElementById('compilerScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
    },

    showUnauthorizedScreen(user) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('unauthorizedScreen').classList.remove('hidden');
        document.getElementById('compilerScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');

        document.getElementById('unauthorizedUser').textContent = user.username;
    },

    showCompilerScreen(user, isAdmin) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('unauthorizedScreen').classList.add('hidden');
        document.getElementById('compilerScreen').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');

        document.getElementById('currentUser').textContent = `👤 ${user.username}`;

        if (isAdmin) {
            document.getElementById('adminPanelBtn').classList.remove('hidden');
        }
    },

    showAdminPanel() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('unauthorizedScreen').classList.add('hidden');
        document.getElementById('compilerScreen').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        this.loadAccountsList();
    },

    loadAccountsList() {
        const authorized = this.getAuthorized();
        const accountsList = document.getElementById('accountsList');
        accountsList.innerHTML = '';

        for (const [userId, userData] of Object.entries(authorized)) {
            const item = document.createElement('div');
            item.className = 'account-item';

            let expiryText = 'Never expires';
            if (userData.expiry) {
                const remaining = userData.expiry - new Date().getTime();
                if (remaining > 0) {
                    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
                    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                    expiryText = `Expires in: ${days}d ${hours}h ${minutes}m`;
                } else {
                    expiryText = 'Expired';
                }
            }

            const roleIcon = userData.isAdmin ? '👑' : '👤';

            item.innerHTML = `
                <div class="account-info">
                    <h3>${roleIcon} ${userData.username || userId}</h3>
                    <p>ID: ${userId}</p>
                    <p>${expiryText}</p>
                </div>
                <div class="account-actions">
                    ${!userData.isAdmin ? `<button onclick="AUTH.deleteUser('${userId}'); AUTH.loadAccountsList();">Delete</button>` : ''}
                </div>
            `;

            accountsList.appendChild(item);
        }
    },

    authorizeUser(userId, days, hours, minutes) {
        const authorized = this.getAuthorized();

        if (!userId) {
            return { success: false, message: 'User ID is required' };
        }

        const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
        const expiry = totalMinutes > 0 ? new Date().getTime() + (totalMinutes * 60 * 1000) : null;

        authorized[userId] = {
            username: `User-${userId.slice(-4)}`,
            expiry,
            isAdmin: false
        };

        this.saveAuthorized(authorized);
        return { success: true, message: 'User authorized successfully' };
    },

    deleteUser(userId) {
        const authorized = this.getAuthorized();
        delete authorized[userId];
        this.saveAuthorized(authorized);
    },

    logout() {
        localStorage.removeItem('discord_user');
        this.showLoginScreen();
    },

    setupEventListeners() {
        // Discord Login
        document.getElementById('discordLoginBtn').addEventListener('click', () => {
            this.loginWithDiscord();
        });

        // Logout from unauthorized screen
        document.getElementById('logoutUnauthorizedBtn').addEventListener('click', () => {
            this.logout();
        });

        // Logout from compiler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Show Admin Panel
        document.getElementById('adminPanelBtn').addEventListener('click', () => {
            this.showAdminPanel();
        });

        // Back to Compiler
        document.getElementById('backToCompilerBtn').addEventListener('click', () => {
            const user = this.getCurrentUser();
            const authorized = this.getAuthorized();
            this.showCompilerScreen(user, authorized[user.id].isAdmin);
        });

        // Authorize User
        document.getElementById('authorizeUserBtn').addEventListener('click', () => {
            const userId = document.getElementById('discordUserId').value.trim();
            const days = parseInt(document.getElementById('expiryDays').value) || 0;
            const hours = parseInt(document.getElementById('expiryHours').value) || 0;
            const minutes = parseInt(document.getElementById('expiryMinutes').value) || 0;

            const result = this.authorizeUser(userId, days, hours, minutes);
            const statusEl = document.getElementById('createAccountStatus');

            statusEl.textContent = result.message;
            statusEl.className = result.success ? 'status-message success' : 'status-message error';
            statusEl.classList.remove('hidden');

            if (result.success) {
                document.getElementById('discordUserId').value = '';
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
    AUTH.init();

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

        const totalLines = 200;
        const codePosition = Math.floor(Math.random() * 40) + 80;

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
