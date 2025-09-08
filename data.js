document.addEventListener("DOMContentLoaded", function () {
    const csvFilePath = "data.csv";
    const updateInterval = 1000; // Fetch new data every 1000 ms (1 second)
    let dataIntervalId = null; // This will store the ID of our interval

    // The updateValue, getElementId, and parseCSV functions remain exactly the same.
    // ... (previous helper functions) ...

    /**
     * A smarter update function that preserves units.
     */
    function updateValue(id, newValue) {
        const el = document.getElementById(id);
        if (!el) return;
        const currentText = el.textContent;
        const unit = currentText.replace(/^-*[\d.]+/g, '').replace('---', '');
        const newText = newValue + unit;
        if (el.textContent !== newText) {
            el.textContent = newText;
        }
    }

    /**
     * Maps CSV header names to the corresponding HTML element IDs.
     */
    function getElementId(csvKey) {
        const idMap = {
            "TEAM_ID":"team-id",
            "Timestamp": "time",
            "PACKET_COUNT": "packets",
            "AX": "AX", "AY": "AY", "AZ": "AZ",
            "GX": "GX", "GY": "GY", "GZ": "GZ",
            "MX": "MX", "MY": "MY", "MZ": "MZ",
            "lat": "latitude",
            "lng": "longitude",
            "Satellites": "satellites",
            "Altitude": "altitude",
            "LUX": "lux",
            "BMP_temp": "bmp-temp",
            "Current": "current",
            "Voltage": "voltage",
            "Pressure": "pressure",
            "Gas": "gas",
            "Error": "error-flag",
            'RSSI': 'rssi',
        };
        return idMap[csvKey] || null;
    }

    /**
     * Fetches the CSV file, parses it, and updates the dashboard.
     */
    async function processAndDisplayData() {
        // This function's logic is the same
        try {
            const response = await fetch(csvFilePath, { cache: "no-cache" });
            if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.statusText}`);
            const csvText = await response.text();
            const data = parseCSV(csvText);
            if (!data || data.length === 0) return;
            const latestData = data[data.length - 1];
            for (const key in latestData) {
                const elementId = getElementId(key);
                if (elementId) {
                    updateValue(elementId, latestData[key]);
                }
            }
        } catch (error) {
            console.error("Error processing data:", error);
        }
    }

    /**
     * A helper function to parse raw CSV text.
     */
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentline = lines[i].split(',').map(v => v.trim());
            headers.forEach((header, j) => {
                obj[header] = currentline[j];
            });
            result.push(obj);
        }
        return result;
    }

    // --- NEW CONTROL FUNCTIONS ---

    function startUpdates() {
        // Check if the updates are already running to avoid multiple loops
        if (dataIntervalId) return;
        console.log("Starting live data updates...");
        // Start the interval and store its ID
        dataIntervalId = setInterval(processAndDisplayData, updateInterval);
    }

    function stopUpdates() {
        if (!dataIntervalId) return; // Do nothing if already stopped
        console.log("Stopping live data updates...");
        // Use the stored ID to clear the interval
        clearInterval(dataIntervalId);
        // Reset the ID to null so we know it's stopped
        dataIntervalId = null;
    }

    // Load initial data once on page load without starting the loop
    processAndDisplayData();
});