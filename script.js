document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('url');
    const methodSelect = document.getElementById('method');
    const sendButton = document.getElementById('send');
    const addParamButton = document.getElementById('add-param');
    const addHeaderButton = document.getElementById('add-header');
    const addFormDataButton = document.getElementById('add-form-data');
    const bodyTypeSelect = document.getElementById('body-type');
    const bodyEditor = document.getElementById('body-editor');
    const formDataContainer = document.getElementById('form-data-container');
    const authTypeSelect = document.getElementById('auth-type');
    const basicAuth = document.getElementById('basic-auth');
    const bearerAuth = document.getElementById('bearer-auth');
    const apiKeyAuth = document.getElementById('api-key-auth');
    const responseBody = document.getElementById('response-body');
    const responseHeadersTable = document.getElementById('response-headers-table').querySelector('tbody');
    const prettyPrintButton = document.getElementById('pretty-print');
    const rawViewButton = document.getElementById('raw-view');
    const copyResponseButton = document.getElementById('copy-response');
    const downloadResponseButton = document.getElementById('download-response');
    const toast = document.getElementById('toast');

    // Tab Functionality
    setupTabs('.tab-button', '.tab-content');
    setupTabs('.response-tab-button', '.response-tab-content');

    // Event Listeners
    addParamButton.addEventListener('click', () => addRow('params-container', 'param'));
    addHeaderButton.addEventListener('click', () => addRow('headers-container', 'header'));
    addFormDataButton.addEventListener('click', () => addRow('form-data-container', 'form-data'));

    // Setup remove buttons for initial template rows
    setupRemoveButtons();

    // Handle body type changes
    bodyTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;

        if (selectedType === 'form-data' || selectedType === 'x-www-form-urlencoded') {
            bodyEditor.classList.add('hidden');
            formDataContainer.classList.remove('hidden');
        } else {
            bodyEditor.classList.remove('hidden');
            formDataContainer.classList.add('hidden');
        }

        if (selectedType === 'json') {
            bodyEditor.placeholder = '{"example": "Enter JSON data here"}';
        } else if (selectedType === 'raw') {
            bodyEditor.placeholder = 'Enter raw request body';
        } else {
            bodyEditor.placeholder = '';
        }
    });

    // Handle auth type changes
    authTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;

        basicAuth.classList.add('hidden');
        bearerAuth.classList.add('hidden');
        apiKeyAuth.classList.add('hidden');

        if (selectedType === 'basic') {
            basicAuth.classList.remove('hidden');
        } else if (selectedType === 'bearer') {
            bearerAuth.classList.remove('hidden');
        } else if (selectedType === 'api-key') {
            apiKeyAuth.classList.remove('hidden');
        }
    });

    // Send request
    sendButton.addEventListener('click', sendRequest);

    // Response actions
    prettyPrintButton.addEventListener('click', prettyPrintResponse);
    rawViewButton.addEventListener('click', showRawResponse);
    copyResponseButton.addEventListener('click', copyResponse);
    downloadResponseButton.addEventListener('click', downloadResponse);

    // Store the raw response for actions
    let currentRawResponse = '';
    let currentResponseObject = null;

    // Add a row to params, headers, or form data
    function addRow(containerId, rowType) {
        const container = document.querySelector(`.${containerId}`);
        const template = container.querySelector(`.${rowType}-row.template`);
        const newRow = template.cloneNode(true);

        // Clear input values in the new row
        newRow.querySelectorAll('input').forEach(input => input.value = '');

        // Remove template class from the new row
        newRow.classList.remove('template');

        // Add event listener to the remove button
        const removeButton = newRow.querySelector(`.remove-${rowType}`);
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                newRow.remove();
            });
        }

        // Append the new row before the add button
        const addButton = container.querySelector(`#add-${rowType}`);
        container.insertBefore(newRow, addButton);
    }

    // Setup remove buttons for initial rows
    function setupRemoveButtons() {
        document.querySelectorAll('.remove-param, .remove-header, .remove-form-data').forEach(button => {
            button.addEventListener('click', function() {
                const row = this.parentElement;
                if (!row.classList.contains('template')) {
                    row.remove();
                }
            });
        });
    }

    // Setup tab functionality
    function setupTabs(tabButtonSelector, tabContentSelector) {
        const tabButtons = document.querySelectorAll(tabButtonSelector);

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Hide all tab content
                const tabContents = document.querySelectorAll(tabContentSelector);
                tabContents.forEach(content => content.classList.add('hidden'));

                // Show corresponding tab content
                const tabId = this.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId).classList.remove('hidden');
            });
        });
    }

    // Send API request
    async function sendRequest() {
        if (!urlInput.value) {
            showToast('Please enter a URL', 'error');
            return;
        }

        const method = methodSelect.value;
        const url = buildUrlWithParams(urlInput.value);

        const options = {
            method: method,
            headers: getRequestHeaders(),
        };

        // Add request body for non-GET/HEAD methods
        if (method !== 'GET' && method !== 'HEAD' && bodyTypeSelect.value !== 'none') {
            const body = getRequestBody();
            if (body) {
                options.body = body;
            }
        }

        // Show loading state
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        responseBody.innerHTML = 'Sending request...';

        try {
            const startTime = Date.now();
            const response = await fetch(url, options);
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Get response data
            let responseData;
            let responseSize = 0;

            try {
                // Try to get as text first
                responseData = await response.text();
                responseSize = new Blob([responseData]).size;
                currentRawResponse = responseData;

                // Try to parse as JSON
                try {
                    currentResponseObject = JSON.parse(responseData);
                    responseData = JSON.stringify(currentResponseObject, null, 2);
                    responseBody.className = 'json';
                } catch (e) {
                    // Not JSON, leave as text
                    currentResponseObject = null;
                    responseBody.className = 'text';
                }
            } catch (e) {
                responseData = 'Error reading response body';
                currentRawResponse = responseData;
                currentResponseObject = null;
            }

            // Display response
            displayResponse(response, responseData, duration, responseSize);

        } catch (error) {
            responseBody.innerHTML = `Error: ${error.message}`;
            currentRawResponse = `Error: ${error.message}`;
            currentResponseObject = null;
            showToast('Request failed: ' + error.message, 'error');
        } finally {
            // Reset button state
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
        }
    }

    // Build URL with query parameters
    function buildUrlWithParams(baseUrl) {
        const url = new URL(baseUrl);

        // Add query parameters
        const paramRows = document.querySelectorAll('#params-tab .param-row:not(.template)');
        paramRows.forEach(row => {
            const key = row.querySelector('.param-key').value.trim();
            const value = row.querySelector('.param-value').value.trim();

            if (key) {
                url.searchParams.append(key, value);
            }
        });

        // Add API Key as query parameter if selected
        const authType = authTypeSelect.value;
        if (authType === 'api-key') {
            const apiKeyLocation = document.getElementById('api-key-location').value;
            const apiKeyName = document.getElementById('api-key-name').value.trim();
            const apiKeyValue = document.getElementById('api-key').value.trim();

            if (apiKeyLocation === 'query' && apiKeyName && apiKeyValue) {
                url.searchParams.append(apiKeyName, apiKeyValue);
            }
        }

        return url.toString();
    }

    // Get request headers
    function getRequestHeaders() {
        const headers = {};

        // Add custom headers
        const headerRows = document.querySelectorAll('#headers-tab .header-row:not(.template)');
        headerRows.forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();

            if (key) {
                headers[key] = value;
            }
        });

        // Add Content-Type header based on body type
        const bodyType = bodyTypeSelect.value;
        if (bodyType === 'json') {
            headers['Content-Type'] = 'application/json';
        } else if (bodyType === 'x-www-form-urlencoded') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        // Note: Form Data Content-Type is automatically set by fetch when using FormData

        // Add Authentication headers
        const authType = authTypeSelect.value;
        if (authType === 'basic') {
            const username = document.getElementById('basic-username').value.trim();
            const password = document.getElementById('basic-password').value.trim();
            if (username || password) {
                const base64Credentials = btoa(`${username}:${password}`);
                headers['Authorization'] = `Basic ${base64Credentials}`;
            }
        } else if (authType === 'bearer') {
            const token = document.getElementById('bearer-token').value.trim();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } else if (authType === 'api-key') {
            const apiKeyLocation = document.getElementById('api-key-location').value;
            const apiKeyName = document.getElementById('api-key-name').value.trim();
            const apiKeyValue = document.getElementById('api-key').value.trim();

            if (apiKeyLocation === 'header' && apiKeyName && apiKeyValue) {
                headers[apiKeyName] = apiKeyValue;
            }
        }

        return headers;
    }

    // Get request body based on selected type
    function getRequestBody() {
        const bodyType = bodyTypeSelect.value;

        if (bodyType === 'none') {
            return null;
        } else if (bodyType === 'json') {
            try {
                // Try to parse the JSON to validate it
                const jsonBody = bodyEditor.value.trim();
                if (!jsonBody) return null;

                JSON.parse(jsonBody);
                return jsonBody;
            } catch (e) {
                showToast('Invalid JSON: ' + e.message, 'error');
                return null;
            }
        } else if (bodyType === 'raw') {
            return bodyEditor.value;
        } else if (bodyType === 'form-data') {
            const formData = new FormData();
            const formRows = document.querySelectorAll('#form-data-container .form-data-row:not(.template)');

            formRows.forEach(row => {
                const key = row.querySelector('.form-key').value.trim();
                const value = row.querySelector('.form-value').value.trim();

                if (key) {
                    formData.append(key, value);
                }
            });

            return formData;
        } else if (bodyType === 'x-www-form-urlencoded') {
            const params = new URLSearchParams();
            const formRows = document.querySelectorAll('#form-data-container .form-data-row:not(.template)');

            formRows.forEach(row => {
                const key = row.querySelector('.form-key').value.trim();
                const value = row.querySelector('.form-value').value.trim();

                if (key) {
                    params.append(key, value);
                }
            });

            return params.toString();
        }

        return null;
    }

    // Display response in the UI
    function displayResponse(response, data, duration, size) {
        // Update response body
        responseBody.innerHTML = data || 'No response data';
        hljs.highlightElement(responseBody);

        // Update response headers
        responseHeadersTable.innerHTML = '';
        for (const [key, value] of response.headers.entries()) {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const valueCell = document.createElement('td');

            keyCell.textContent = key;
            valueCell.textContent = value;

            row.appendChild(keyCell);
            row.appendChild(valueCell);
            responseHeadersTable.appendChild(row);
        }

        // Update response meta information
        const responseMeta = document.querySelector('.response-meta');
        responseMeta.classList.remove('hidden');

        const statusElement = responseMeta.querySelector('.status');
        statusElement.textContent = `${response.status} ${response.statusText}`;

        // Style status based on code
        statusElement.className = 'status';
        if (response.status >= 200 && response.status < 300) {
            statusElement.classList.add('success');
        } else if (response.status >= 300 && response.status < 400) {
            statusElement.classList.add('redirect');
        } else if (response.status >= 400 && response.status < 500) {
            statusElement.classList.add('client-error');
        } else {
            statusElement.classList.add('server-error');
        }

        responseMeta.querySelector('.time').textContent = `${duration}ms`;

        const sizeInKB = (size / 1024).toFixed(2);
        responseMeta.querySelector('.size').textContent = `${sizeInKB} KB`;

        // Enable response action buttons
        prettyPrintButton.disabled = false;
        rawViewButton.disabled = false;
        copyResponseButton.disabled = false;
        downloadResponseButton.disabled = false;
    }

    // Pretty print JSON response
    function prettyPrintResponse() {
        if (currentResponseObject) {
            responseBody.innerHTML = JSON.stringify(currentResponseObject, null, 2);
            hljs.highlightElement(responseBody);
        }
    }

    // Show raw response
    function showRawResponse() {
        responseBody.innerHTML = currentRawResponse;
        responseBody.className = 'text';
    }

    // Copy response to clipboard
    function copyResponse() {
        navigator.clipboard.writeText(responseBody.textContent)
            .then(() => {
                showToast('Response copied to clipboard', 'success');
            })
            .catch(err => {
                showToast('Failed to copy response: ' + err, 'error');
            });
    }

    // Download response as file
    function downloadResponse() {
        let filename = 'response';
        let contentType = 'text/plain';
        let content = currentRawResponse;

        if (currentResponseObject) {
            filename += '.json';
            contentType = 'application/json';
            content = JSON.stringify(currentResponseObject, null, 2);
        } else {
            filename += '.txt';
        }

        const blob = new Blob([content], {
            type: contentType
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);

        showToast('Response downloaded', 'success');
    }

    // Show toast message
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});