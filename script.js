
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.searchInput');
    const dataTable = document.getElementById('dataTable');
    const ctx = document.getElementById('transactionChart').getContext('2d');

    let customers = [];
    let transactions = [];

    // Fetch data from local JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            customers = data.customers;
            transactions = data.transactions;
            displayData(customers, transactions);
        })
        .catch(error => console.error('Error fetching data:', error));

    // Display data in the table
    function displayData(customers, transactions) {
        let tableHTML = '';
        transactions.forEach(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            if (customer) {
                tableHTML += `<tr>
                    <td>${customer.name}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.amount}</td>
                </tr>`;
            }
        });
        dataTable.innerHTML = tableHTML;
    }

    // Filter table based on search input
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            return customer.name.toLowerCase().includes(searchTerm) ||
                   transaction.amount.toString().includes(searchTerm);
        });
        displayData(customers, filteredTransactions);
    });

    // Display chart for total transaction amount per day for selected customer
    function displayChart(customerId) {
        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
        const data = dates.map(date => {
            const totalAmount = customerTransactions
                .filter(transaction => transaction.date === date)
                .reduce((sum, transaction) => sum + transaction.amount, 0);
            return { date, totalAmount };
        });

        const chartLabels = data.map(entry => entry.date);
        const chartData = data.map(entry => entry.totalAmount);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Total Transaction Amount',
                    data: chartData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Amount ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // Example: Display chart for the first customer initially
    if (transactions.length > 0) {
        displayChart(transactions[0].customer_id);
    }
});