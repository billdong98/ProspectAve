const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const http = require("http");
const dateFormat = require("dateformat");
const cors = require('cors');
app.use(cors());

const PASSWORD = "HM-Upload";
const ENCODED = Buffer.from(PASSWORD).toString('base64');

//DB part
const mysql = require('mysql');

var pool = mysql.createPool({
    host     : 'kidstarter.fund',
    user     : 'node-server',
    password : 'node-db',
    database : 'Upper_Chores',
    dateStrings: 'date'
});

//console.log(pool);
/*
var connection = mysql.createConnection({
    host     : 'kidstarter.fund',
    user     : 'node-server',
    password : 'node-db',
    database : 'Upper_Chores',
    dateStrings: 'date'
});

connection.connect();*/

/*
app.post('/', function(req, response){
    console.log(req.body);      // your JSON
    req.send("Roger!");    // echo the result back
});*/

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:61195');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', (request, response) => { 
    var date = new Date();
    var month = date.getMonth() + 1;
    console.log('Hello getter! It is currently: ' + month);
    
    /* pull all rows from the table 'schedule' where the month of the date is equal to the variable 'month' 
        order them with the date in ascending order
    */
    var query = "SELECT * from schedule where MONTH(date) = "+month+" ORDER BY DATE ASC";

    pool.getConnection(function(err, conn) {
        conn.query(query, function(err, rows) {
            if (err){
                console.log(err);
                conn.release();
                response.status(500);
                response.end("Get error");
            } else {
            //returns the rows in this month
            //console.log(rows);
            response.send(rows);
            conn.release();
            }
        });
    });
})

app.post('/', (request, response) => {  
    var coded_pass = request.header("Authentication");
    console.log("Password given: " + coded_pass);

    if(coded_pass === ENCODED){
        var array = request.body;
        console.log("Access granted.");
        
        /* for each JSON object, create a new row and populate each column date, k1, k2...) with the values of the JSON*/
        
        var sql = "INSERT INTO schedule (date, k1, k2,t1,t2,v1,v2) VALUES ?";
        var values = [];
        //process JSON data into array for insertion
        for(var i=0; i< array.length; i++){
            var obj = array[i];
            var dateObj = dateFormat(obj.date, "yyyy-mm-dd");
            values[values.length] = [dateObj,obj.k1,obj.k2,obj.t1,obj.t2,obj.v1,obj.v2];
        }
        
        if(array.length == 0){
            console.log("INVALID INPUT");
            response.status(400);
            response.end("INVALID INPUT");
            return;
        }
        //console.log(values);
        pool.getConnection(function(err, conn) {
            /*clear the table*/
            conn.query("TRUNCATE schedule",function(err){
                if (err){
                    //console.log(err);
                    console.log("Truncate error.");
                    conn.release();
                    response.status(400);
                    response.end("Bad input");
                }
            });
            /*run the query to insert the data*/
            conn.query(sql, [values], function(err,rows) {
                if (err){
                    //console.log(err);
                    console.log("Insertion error.");
                    conn.release();
                    response.status(400);
                    response.end("Bad input");
                } else {
                //returns results and how many rows changed
                    console.log(rows);
                    conn.release();
                    response.send("OK");
                }
            });
           
        });
    } else {
        console.log("Access denied. Data ignored.");
        response.status(403);
        response.end("Wrong password!");
    }
})

app.listen(8081, (err) => {  
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening on port: 8081');
})
/*
node /Users/michaelzman/Desktop/PROGRAMMIN\'/Web\ Projects/Upper\ Chores/algorithm-js/server.js 
*/