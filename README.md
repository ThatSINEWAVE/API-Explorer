<div align="center">

# [API Explorer](https://thatsinewave.github.io/API-Explorer)

![ChromaLab](https://raw.githubusercontent.com/ThatSINEWAVE/API-Explorer/refs/heads/main/.github/SCREENSHOTS/API-Explorer.png)

A lightweight, browser-based REST API testing tool that allows you to test and debug API endpoints directly in your browser, without installing any software.

</div>

## Features

- **Intuitive Interface**: Clean, dark-themed interface designed for developers
- **Support for All HTTP Methods**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Request Configuration**:
  - URL Parameters
  - Custom Headers
  - Request Body (JSON, Form Data, x-www-form-urlencoded, Raw)
  - Authentication (Basic Auth, Bearer Token, API Key)
- **Response Handling**:
  - Syntax highlighting for JSON responses
  - Response headers display
  - Status code indicators with color coding
  - Response time and size metrics
- **Useful Utilities**:
  - Pretty print JSON responses
  - Raw view option
  - Copy response to clipboard
  - Download response as file

<div align="center">

## ☕ [Support my work on Ko-Fi](https://ko-fi.com/thatsinewave)

</div>

## Usage

### Making a Simple GET Request

1. Select `GET` from the method dropdown
2. Enter the API endpoint URL
3. Click "Send"
4. View the response in the response panel

### Adding Query Parameters

1. In the "Params" tab, add key-value pairs
2. Each parameter will be appended to the URL as query parameters

### Setting Headers

1. Navigate to the "Headers" tab
2. Add custom header key-value pairs

### Sending Body Data

1. Go to the "Body" tab
2. Select the appropriate content type:
   - JSON: Enter valid JSON data
   - Form Data: Add key-value pairs
   - x-www-form-urlencoded: Add key-value pairs
   - Raw: Enter raw request body

### Using Authentication

1. Navigate to the "Auth" tab
2. Select the authentication type:
   - Basic Auth: Enter username and password
   - Bearer Token: Enter token value
   - API Key: Enter key name, value, and location (header or query parameter)

## Installation

No installation required! This is a pure client-side application that runs entirely in your browser.

To run locally:

1. Clone the repository:
   ```
   git clone https://github.com/ThatSINEWAVE/API-Explorer.git
   ```

2. Open `index.html` in your browser

To host on your own server, simply upload all files to any static web hosting service.

## Browser Compatibility

API Explorer works on all modern browsers including:
- Chrome
- Firefox
- Edge
- Safari

<div align="center">

## [Join my Discord server](https://discord.gg/2nHHHBWNDw)

</div>

## Technical Details

API Explorer is built with:
- **Vanilla JavaScript** - no framework dependencies
- **CSS3** - with custom properties for theming
- **HTML5**
- **highlight.js** - For syntax highlighting of code responses
- **atom-one-dark.min.css** - Dark theme for highlighted code
- **Font Awesome** (all.min.css) - For icons throughout the interface
- **json.min.js** - Extension for highlight.js to properly highlight JSON

The application uses the Fetch API for making HTTP requests, which provides a more powerful and flexible feature set than older techniques like XMLHttpRequest.

## Limitations

- Due to browser security restrictions (CORS), some API endpoints may not be accessible directly. In these cases, you may need to use a CORS proxy.
- No persistent storage of request history (all data is lost on page refresh)
- File uploads are not yet supported

## Contributing

Feel free to submit issues or contribute improvements via pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).



