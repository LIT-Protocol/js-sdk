import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;
const logDirectory = path.join(__dirname, 'logs'); // Adjust path as needed

app.use(express.static('public'));

interface LogEntry {
  type: string;
  status: string;
  duration?: number;
  timestamp: string;
}

interface NetworkStats {
  success: number;
  failure: number;
  totalDuration: number;
  totalRuns: number;
  successRate: number;
  failureRate: number;
  latestTimestamp: string;
}

interface LogFile {
  name: string;
  path: string;
  network: string;
  timestamp: string;
}

function categorizeNetwork(filename: string): string {
  if (filename.startsWith('datil-dev')) return 'datil-dev';
  if (filename.startsWith('datil-test')) return 'datil-test';
  return 'datil';
}

// Function to parse log file content
function parseLogContent(content: string): NetworkStats {
  const entries: LogEntry[] = content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  const results: NetworkStats = {
    success: 0,
    failure: 0,
    totalDuration: 0,
    totalRuns: 0,
    successRate: 0,
    failureRate: 0,
    latestTimestamp: '',
  };

  entries.forEach((entry) => {
    if (entry.type === 'test_result') {
      if (entry.status === 'success') {
        results.success += 1;
        results.totalDuration += entry.duration || 0;
      } else if (entry.status === 'error') {
        results.failure += 1;
      }
      results.totalRuns += 1;
      if (entry.timestamp > results.latestTimestamp) {
        results.latestTimestamp = entry.timestamp;
      }
    }
  });

  results.successRate = results.totalRuns
    ? (results.success / results.totalRuns) * 100
    : 0;
  results.failureRate = results.totalRuns
    ? (results.failure / results.totalRuns) * 100
    : 0;

  return results;
}

// Get list of log files with pagination
app.get('/logs', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 7;
  const network = (req.query.network as string) || 'all';

  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to read log directory.');
    }

    let logFiles: LogFile[] = files
      .filter((file) => file.endsWith('.log'))
      .map((file) => {
        const filePath = path.join(logDirectory, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          network: categorizeNetwork(file),
          timestamp: stats.mtime.toISOString(),
        };
      });

    // Filter by network if specified
    if (network !== 'all') {
      logFiles = logFiles.filter((file) => file.network === network);
    }

    // Sort by timestamp (latest first)
    logFiles.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const totalItems = logFiles.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Apply pagination
    const paginatedFiles = logFiles.slice(offset, offset + limit);

    res.json({
      data: paginatedFiles,
      page,
      limit,
      totalItems,
      totalPages,
    });
  });
});

// Serve the log file download
app.get('/logs/:filename', (req, res) => {
  const filePath = path.join(logDirectory, req.params.filename);
  res.download(filePath);
});

// Get log file details
app.get('/logs/details/:filename', (req, res) => {
  const filePath = path.join(logDirectory, req.params.filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Unable to read log file.');
    }

    const stats = parseLogContent(data);
    res.json(stats);
  });
});

// Get network statistics
app.get('/network-stats', (req, res) => {
  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to read log directory.');
    }

    const networkStats: { [key: string]: NetworkStats } = {};

    files
      .filter((file) => file.endsWith('.log'))
      .forEach((file) => {
        const network = categorizeNetwork(file);
        const filePath = path.join(logDirectory, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = parseLogContent(content);

        if (!networkStats[network]) {
          networkStats[network] = { ...stats };
        } else {
          networkStats[network].success += stats.success;
          networkStats[network].failure += stats.failure;
          networkStats[network].totalDuration += stats.totalDuration;
          networkStats[network].totalRuns += stats.totalRuns;
          if (stats.latestTimestamp > networkStats[network].latestTimestamp) {
            networkStats[network].latestTimestamp = stats.latestTimestamp;
          }
        }
      });

    // Calculate success and failure rates for each network
    Object.keys(networkStats).forEach((network) => {
      const stats = networkStats[network];
      stats.successRate = stats.totalRuns
        ? (stats.success / stats.totalRuns) * 100
        : 0;
      stats.failureRate = stats.totalRuns
        ? (stats.failure / stats.totalRuns) * 100
        : 0;
    });

    res.json(networkStats);
  });
});

// Serve the HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Log Files Analysis</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .chart-container {
            width: 80%;
            margin: 20px auto;
        }
        #networkSelect, #paginationControls {
            margin: 20px 0;
            padding: 5px;
        }
.pagination-button {
    margin: 0 5px;
    padding: 5px 10px;
    cursor: pointer;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.pagination-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

#paginationControls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}
            
    </style>
</head>
<body>
    <h1>Log Files Analysis</h1>
    
    <label for="networkSelect">Select Network:</label>
    <select id="networkSelect">
        <option value="all">All Networks</option>
    </select>

    <h2>Individual Log Files</h2>
    <table>
        <thead>
            <tr>
                <th>File Name</th>
                <th>Network</th>
                <th>Timestamp</th>
                <th>Actions</th>
                <th>Success</th>
                <th>Failures</th>
                <th>Total Duration (ms)</th>
                <th>Success Rate (%)</th>
                <th>Failure Rate (%)</th>
            </tr>
        </thead>
        <tbody id="log-table-body">
        </tbody>
    </table>
    <div id="paginationControls"></div>

    <h2>Network Statistics</h2>
    <table>
        <thead>
            <tr>
                <th>Network</th>
                <th>Latest Timestamp</th>
                <th>Success</th>
                <th>Failures</th>
                <th>Total Duration (ms)</th>
                <th>Success Rate (%)</th>
                <th>Failure Rate (%)</th>
            </tr>
        </thead>
        <tbody id="network-stats-body">
        </tbody>
    </table>

    <div class="chart-container">
        <canvas id="networkRatesChart"></canvas>
    </div>

    <script>
let allNetworkStats = {};
let currentPage = 1;
let totalPages = 1;
let currentNetwork = 'all';

function categorizeNetwork(filename) {
    if (filename.startsWith('datil-dev')) return 'datil-dev';
    if (filename.startsWith('datil-test')) return 'datil-test';
    return 'datil';
}

async function fetchLogs(page = 1, network = 'all') {
    const response = await fetch(\`/logs?page=\${page}&limit=6&network=\${network}\`);
    const data = await response.json();
    console.log('Fetched log data:', data);
    displayLogs(data.data);
    updatePagination(data.page, data.totalPages);
    currentPage = data.page;
    totalPages = data.totalPages;
}

async function fetchNetworkStats() {
    const response = await fetch('/network-stats');
    allNetworkStats = await response.json();
    displayNetworkStats();
    createChart();
    populateNetworkSelect();
}

function populateNetworkSelect() {
    const networkSelect = document.getElementById('networkSelect');
    networkSelect.innerHTML = '<option value="all">All Networks</option>';
    Object.keys(allNetworkStats).forEach(network => {
        const option = document.createElement('option');
        option.value = network;
        option.textContent = network;
        networkSelect.appendChild(option);
    });
}

async function displayLogs(logs) {
    const tableBody = document.getElementById('log-table-body');
    tableBody.innerHTML = '';

    for (const log of logs) {
        const detailsResponse = await fetch('/logs/details/' + log.name);
        const details = await detailsResponse.json();

        const row = document.createElement('tr');
        row.innerHTML = \`
            <td>\${log.name}</td>
            <td>\${log.network}</td>
            <td>\${new Date(log.timestamp).toLocaleString()}</td>
            <td><a href="/logs/\${log.name}" download>Download</a></td>
            <td>\${details.success}</td>
            <td>\${details.failure}</td>
            <td>\${details.totalDuration}</td>
            <td>\${details.successRate.toFixed(2)}</td>
            <td>\${details.failureRate.toFixed(2)}</td>
        \`;
        tableBody.appendChild(row);
    }
}

function updatePagination(currentPage, totalPages) {
    console.log('Updating pagination:', { currentPage, totalPages });
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = '';

    const prevButton = createPaginationButton('Previous', () => fetchLogs(currentPage - 1, currentNetwork));
    prevButton.disabled = currentPage === 1;
    paginationControls.appendChild(prevButton);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(i.toString(), () => fetchLogs(i, currentNetwork));
        pageButton.classList.toggle('active', i === currentPage);
        paginationControls.appendChild(pageButton);
    }

    const nextButton = createPaginationButton('Next', () => fetchLogs(currentPage + 1, currentNetwork));
    nextButton.disabled = currentPage === totalPages;
    paginationControls.appendChild(nextButton);
}

function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'pagination-button';
    button.onclick = onClick;
    button.style.display = 'inline-block';
    button.style.margin = '0 5px';
    button.style.padding = '5px 10px';
    return button;
}

function displayNetworkStats() {
    const tableBody = document.getElementById('network-stats-body');
    tableBody.innerHTML = '';

    Object.entries(allNetworkStats).forEach(([network, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = \`
            <td>\${network}</td>
            <td>\${stats.latestTimestamp}</td>
            <td>\${stats.success}</td>
            <td>\${stats.failure}</td>
            <td>\${stats.totalDuration}</td>
            <td>\${stats.successRate.toFixed(2)}</td>
            <td>\${stats.failureRate.toFixed(2)}</td>
        \`;
        tableBody.appendChild(row);
    });
}

function createChart() {
    const networks = Object.keys(allNetworkStats);
    const successRates = networks.map(network => allNetworkStats[network].successRate);
    const failureRates = networks.map(network => allNetworkStats[network].failureRate);

    const ctx = document.getElementById('networkRatesChart').getContext('2d');
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: networks,
            datasets: [
                {
                    label: 'Success Rate (%)',
                    data: successRates,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Failure Rate (%)',
                    data: failureRates,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Rate (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Network'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Success and Failure Rates by Network'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

document.getElementById('networkSelect').addEventListener('change', function() {
    currentNetwork = this.value;
    currentPage = 1;
    fetchLogs(currentPage, currentNetwork);
});

fetchLogs(1, 'all');
fetchNetworkStats();
    </script>
</body>
</html>
`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
