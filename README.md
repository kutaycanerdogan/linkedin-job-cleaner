# LinkedIn Job Cleaner

A lightweight, high-performance browser extension designed to declutter your LinkedIn job search experience. It automatically hides job postings that are already **Applied**, **Viewed**, or marked as **Promoted**.

## Features

*   **Smart Filtering**: Automatically identifies and hides job cards based on your interaction history.
*   **Ad-Block for Jobs**: Removes "Promoted" (Sponsored) listings to focus on organic opportunities.
*   **Multi-Language Support**: Automatically detects LinkedIn's UI language and applies corresponding filters (Current support: English, Turkish).
*   **Real-time Toggle**: Update your preferences via the popup menu without needing to refresh the page.
*   **Privacy-Focused**: Works entirely locally. No data is sent to external servers.

## Installation

### For Developers (Local Loading)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/kutaycanerdogan/linkedin-job-cleaner.git

2.  **Load the extension in Chrome**:
    -   Open Chrome and navigate to `chrome://extensions/`.
    -   Enable **Developer mode** (toggle in the top-right corner).
    -   Click **Load unpacked** and select the cloned repository folder.

3.  **Load the extension in Firefox**:
    -   Open Firefox and navigate to `about:debugging`.
    -   Click **This Firefox** and then **Load Temporary Add-on**.
    -   Select any file from the cloned repository folder.
## Usage

1.  **Navigate to LinkedIn Jobs**: Open your LinkedIn job search page.
2.  **Toggle Filters**: Use the extension's popup menu to enable/disable filters as needed.
3.  **Enjoy a Cleaner Feed**: The extension will automatically hide unwanted job postings.

## How It Works

The extension uses a MutationObserver to monitor the LinkedIn job list. As new jobs are loaded (via pagination or scrolling), it scans the text content of each li.scaffold-layout__list-item for specific keywords defined in a local dictionary.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Kutaycan Erdoğan](https://github.com/kutaycanerdogan).