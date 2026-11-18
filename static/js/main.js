/**
 * Civil AI - Frontend logic
 * Handles auth, voice input, PDF display, chat, and API interaction
 * Developers: Montu Soni, Priyanshu, Lalit
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const historyList = document.getElementById('history-list');

    // State Variables
    let isListening = false;
    let recognition = null;
    let currentUser = null; // Mock user for context. Integrated with Firebase logic.

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = document.documentElement.lang === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            isListening = false;
            micBtn.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            isListening = false;
            micBtn.classList.remove('listening');
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
        };
    } else {
        console.warn("Speech recognition not supported");
        micBtn.style.display = 'none';
    }

    // Helper: Display Message
    function displayMessage(sender, text, timestamp = new Date().toLocaleTimeString()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textSpan = document.createElement('span');
        textSpan.innerHTML = text.replace(/\n/g, '<br>'); // Simple formatting
        
        const metaSpan = document.createElement('span');
        metaSpan.className = 'message-meta';
        metaSpan.innerText = `${timestamp}`;

        contentDiv.appendChild(textSpan);
        contentDiv.appendChild(metaSpan);

        // Copy/Download Button Context
        if(sender === 'AI') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.innerText = 'Copy';
            copyBtn.onclick = () => navigator.clipboard.writeText(text);
            
            const downloadBtn = document.createElement('button');
            downloadBtn.innerText = 'Download PDF';
            downloadBtn.onclick = () => downloadAsPDF(text);

            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(downloadBtn);
            contentDiv.appendChild(actionsDiv);
        }

        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // API Interaction: Send Query
    async function sendQuery(text, file = null) {
        displayMessage('User', text || (file ? `Uploaded file: ${file.name}` : '...'));
        
        try {
            const formData = new FormData();
            if(text) formData.append('text', text);
            if(file) formData.append('file', file);

            // Fetch session ID and user ID if implemented
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            displayMessage('AI', data.response);
            loadHistory(); // Reload history after new interaction

        } catch (error) {
            console.error('Error:', error);
            displayMessage('AI', 'Sorry, I encountered an error processing your request.');
        }
    }

    // Helper: Download Text as PDF
    async function downloadAsPDF(text) {
        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: text})
            });

            if(response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'civilai_response.pdf';
                document.body.appendChild(a);
                a.click(); a.remove();
            }
        } catch(error) {
            console.error('PDF error', error);
        }
    }

    // API Interaction: Load History
    async function loadHistory() {
        if(!currentUser) return;
        try {
            const response = await fetch(`/api/history?userId=${currentUser}`);
            const history = await response.json();
            historyList.innerHTML = '';
            history.slice(0, 10).forEach(item => {
                const li = document.createElement('li');
                li.innerText = item.title;
                li.onclick = () => displayMessage('AI', item.full_text, item.timestamp);
                historyList.appendChild(li);
            });
        } catch (error) {
            console.error('History load error', error);
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            sendQuery(text);
            userInput.value = '';
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            micBtn.classList.add('listening');
            isListening = true;
        }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            sendQuery(null, e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });

    // Mock Authentication Logic
    loginBtn.addEventListener('click', () => {
        currentUser = "test_user_123"; // Firebase logic goes here
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        displayMessage('System', 'Logged in successfully.');
        loadHistory();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        historyList.innerHTML = '';
        displayMessage('System', 'Logged out.');
    });

    // Initial load
    displayMessage('AI', 'Welcome to CIVIL AI. How can I assist you today?');
});