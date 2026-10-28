const API_BASE_URL = 'http://localhost:8000';

// DOM elements
const sendForm = document.getElementById('sendForm');
const sensorInput = document.getElementById('sensorInput');
const valueInput = document.getElementById('valueInput');
const messageInput = document.getElementById('messageInput');
const sendStatus = document.getElementById('sendStatus');
const refreshBtn = document.getElementById('refreshBtn');
const messagesContainer = document.getElementById('messagesContainer');

// Send message to Kafka
sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sensor_id = sensorInput.value.trim();
    const value = parseFloat(valueInput.value);
    const message = messageInput.value.trim();

    if (!sensor_id || isNaN(value)) return;

    try {
        sendStatus.textContent = 'Sending...';
        sendStatus.className = 'status';

        const payload = { sensor_id, value };
        if (message) payload.message = message;

        const response = await fetch(`${API_BASE_URL}/produce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        sendStatus.textContent = `✓ Sent: ${data.sent.sensor_id} = ${data.sent.value}`;
        sendStatus.className = 'status success';

        sensorInput.value = '';
        valueInput.value = '';
        messageInput.value = '';

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

        messages.forEach((record, index) => {
            const v = record.value;
            const appTime = new Date(v.timestamp).toLocaleString();
            const kafkaTime = new Date(record.kafka_timestamp).toLocaleString();

            html += `
                <div class="message-item">
                    <div><strong>Sensor:</strong> ${escapeHtml(v.sensor_id)} | <strong>Value:</strong> ${v.value}</div>
                    <div><small>App Time: ${appTime} | Kafka Time: ${kafkaTime}</small></div>
                    ${v.message ? `<div><small>${escapeHtml(v.message)}</small></div>` : ''}
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
