const API_BASE_URL = 'http://localhost:8000';

// DOM elements
const sendForm = document.getElementById('sendForm');
const messageInput = document.getElementById('messageInput');
const sendStatus = document.getElementById('sendStatus');
const refreshBtn = document.getElementById('refreshBtn');
const messagesContainer = document.getElementById('messagesContainer');

// Send message to Kafka
sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    try {
        sendStatus.textContent = 'Sending...';
        sendStatus.className = 'status';

        const response = await fetch(`${API_BASE_URL}/produce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        sendStatus.textContent = `✓ Message sent: "${data.sent}"`;
        sendStatus.className = 'status success';

        messageInput.value = '';

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            sendStatus.textContent = '';
            sendStatus.className = 'status';
        }, 3000);

    } catch (error) {
        sendStatus.textContent = `✗ Error: ${error.message}`;
        sendStatus.className = 'status error';
    }
});

// Fetch and display messages
async function fetchMessages() {
    try {
        messagesContainer.innerHTML = '<p class="loading">Loading messages...</p>';

        const response = await fetch(`${API_BASE_URL}/messages`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const messages = data.messages || [];

        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p class="empty-state">No messages in topic yet</p>';
            return;
        }

        let html = `<p class="message-count">Showing last ${messages.length} messages:</p>`;

        messages.forEach((msg, index) => {
            html += `
                <div class="message-item">
                    <strong>#${messages.length - index}:</strong> ${escapeHtml(msg)}
                </div>
            `;
        });

        messagesContainer.innerHTML = html;

    } catch (error) {
        messagesContainer.innerHTML = `
            <p class="empty-state" style="color: #d9534f;">
                Error loading messages: ${error.message}
            </p>
        `;
    }
}

// Refresh button click handler
refreshBtn.addEventListener('click', fetchMessages);

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load messages on page load
window.addEventListener('load', fetchMessages);
