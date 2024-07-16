document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
  
    // Function to fetch JSON data from a given URL
    const fetchData = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        displayData(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        dataContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
      }
    };
  
    // Function to display JSON data
    const displayData = (data) => {
      dataContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    };
  
    // URLs of the JSON files (A to M)
    const jsonUrls = [
      'https://root-servers.org/root/A/json/',
      'https://root-servers.org/root/B/json/',
      'https://root-servers.org/root/C/json/',
      // Add URLs for D to M
    ];
  
    // Fetch data from each URL
    jsonUrls.forEach(url => fetchData(url));
  });
  