//this script wil test connectivity to a news source before adding it to
const axios = require('axios');

axios.get('https://www.csail.mit.edu/news/')
    .then(response => {
        console.log('Connected to Axios');
    })
    .catch(error => {
        console.log('Failed to connect to Axios');
    });
