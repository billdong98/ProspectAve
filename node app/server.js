const express = require('express');
const app = express();

const http = require("http");
const cors = require('cors');
app.use(cors());


app.get('/', (request, response) => { 
    console.log('Hello getter!');
    response.send("Hello, World");

})


app.listen(1738, (err) => {  
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening on port: 1738');
})