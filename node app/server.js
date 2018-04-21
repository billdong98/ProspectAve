const express = require('express');
const app = express();
const fs = require('fs');
const http = require("http");
const cors = require('cors');
// require the sqlite module
const sqlite3 = require('sqlite3').verbose();
// to read POST request bodies
const bodyParser = require('body-parser');
const dateTime = require('node-datetime');

const auth = require('./Auth.js');

// for handling sessions
var cookieSession = require('cookie-session');

// setup Express server
app.use(bodyParser.json());

var whitelist = ['https://prospectave.io', 'http://localhost', 'https://prospectave.io:1738', 'http://127.0.0.1', 'null', 'https://www.prospectave.io'];

var corsOptions = {
  origin: function (origin, callback) {
      
      //TESTING CORS OVERRIDES ONLY.
    if(origin == null){
        callback(null, true);
        return;
    }
      
    if(origin.includes("http://127.0.0.1:")){
        console.log("override for testing");
        callback(null, true);
        return;
    }
      
    if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
    } else {
        console.log('Not allowed by CORS: ' + origin);
        callback(null, false);
    }
  },
  credentials: true
}

app.use(cors(corsOptions));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});


//let corsCred = cors({credentials:true, origin: 'https://prospectave.io'});
 
//app.options('/officer_download', corsCred);

app.use(cookieSession({
    name: 'prospectave_session',
    secret: 'verysecurekey',
    domain: 'prospectave.io',
    httpOnly: false,
    sameSite: 'lax',
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

var https = require('https');

/* handling HTTPS */
const options = {
    key: fs.readFileSync('./../../ssl/keys/9f016_d0a13_46664a744423c921776ce2dde252b120.key').toString(),
    cert: fs.readFileSync('./../../ssl/certs/prospectave_io_9f016_d0a13_1530835199_f77b28e7908bb77ad4e6cbe0ea03205e.crt').toString()
};

https.createServer(options, app).listen(1738);
console.log("Server listening on port: " + 1738);
console.log("Current date: " + currentDate());

// connect to the db file
let db = new sqlite3.Database('./clubs.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite DB.');
});


/* SQLITE QUERIES */

// insert a new row into the database
// [(club_name, date, poster, post_date, status, info)]
let postQuery = 'INSERT INTO club_status VALUES ';
let placeholders = '(?,?,?,?,?,?)';
// part of a query
let afterToday = "DATE(substr(date,7,4)||'-'||substr(date,1,2)||'-'||substr(date,4,2)) >= date('now')";
// gets all records from club_status after today
let selectAll = 'SELECT * FROM club_status WHERE ' + afterToday + ' ORDER BY date';
// get records from club_status for a particular club (after today)
let selectByClub = 'SELECT * FROM club_status WHERE club_name = ? and ' + afterToday + ' ORDER BY date';
// delete a given event (club and date needed)
let deleteEventsQuery = 'DELETE from club_status WHERE date = ? and club_name = ?';



/* gets the current clubs from the DB */
/* allow ALL domains */
app.get('/status', cors(), (request, response) => { 
    console.log('Hello getter! Current date: ' + currentDate());

    db.all(selectAll, [], (err, rows) => {
        if(err){
            throw err;
        }

        console.log("GET: sent " + rows.length + " rows.");
        response.send(rows);
    });
})

// logs the user in. 
// if the user is already logged in (has session cookie), then redirect to the officer page
// else if the user
// if not, then redirect to CAS 
app.get('/login', (request, response) => { 
    console.log('Login');
    
    if(request.session.isPopulated) {
        console.log("Already logged in");
        console.log(`Redirecting: ${request.session.id}`);
        auth.redirectOfficer(response);
        // redirect to officer page
        return;
    }
    
    var callback = function(result){
            if(result != false){
                // logged in, but not an officer
                if(auth.getClub(result) == null){
                    console.log("Attempted login by: " + result);
                    auth.redirectFailedAttempt(response);
                } else {
                    request.session.id = result;
                    console.log("Created cookie for: " + request.session.id);
                    auth.redirectOfficer(response);
                    return;
                }
            } else {
                response.status(500);
                response.send("Bad auth token.");
            }
        }.bind({request: request, response: response});
    
    // no ticket, need to authenticate
    if(!request.query.ticket){
        console.log("Redirecting to CAS");
        auth.redirect(response);
    } else {
        // we have just been redirected back here by CAS
        auth.verify(request.query.ticket, callback); 
    }
})


// sends netID and club information as JSON to officer.html
app.get('/userinfo', (request, response) => { 
    response.setHeader('Content-Type', 'application/json');
        
    var data = {netID: null, club: null};
    if(!request.session.isPopulated) {
        data.club(null);
        console.log("Not logged in.");
    } else {
        console.log("Welcoming, " + request.session.id);
        data.netID = request.session.id;
        // get club from auth
        data.club = auth.getClub(data.netID); 
    }
    response.json(data);
});


// sends netID and club events as JSON to officer.html
app.get('/officer_download', (request, response) => { 
    response.setHeader('Content-Type', 'application/json');
        
    var identity = auth.identity(request);
    
    if(identity == null) {
        console.log("Failed attempt to get club data");
        response.json({"identity": null, "rows": null});
        return;
    } else { 
        var data = {"identity": identity, "rows" : null};
        console.log("Sending data for (" + identity.netID + ", club: " + identity.club + ")");
        // get row for this club
        db.all(selectByClub, [identity.club], (err, rows) => {
            if(err){
                throw err;
            }
            console.log("For: " + identity.club + " found " + rows.length + " rows.");
            data.rows = rows;
            response.json(data);
        });
    }  
});

/* handles a post request of club data */
app.post('/officer_post', (request, response) => {
    
    // TODO delete rows if they already exist 
    
    // authenticate 
    var identity = auth.identity(request);
    if(identity == null) {
        console.log("Failed attempt to add events!");
        response.send("You need to be logged in to add events!");
        return;
    }

    // json object input 
    var obj = request.body;
    var club = identity.club;
    // array of date strings
    var dates = obj.d;
    var netID = identity.netID;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;

    var data = [];
    var query = postQuery;
    
    if(!(dates instanceof Array)){
        console.log("Bad input!");
        response.send("Bad input!");
        return;
    }
    // construct query and input for each element in dates
    for(var i=0; i<dates.length;i++){
        if(i != 0){
            query += ", ";
        }
        query += placeholders;
        var date = dates[i];
        data.push(club, date, netID, post_date, status, info);
    }

    console.log(query);
    console.log(data);
    var add = addEvent(response, query, data);
    if(add == 1){
        response.send("Successfully added data!");
    } else {
        response.send("Failed to add data to database!");
    }
})

/* deletes a given date */
app.post('/delete', (request, response) => {
    // authenticate 
    var identity = auth.identity(request);
    if(identity == null) {
        console.log("Failed attempt to delete events!");
        response.send("You need to be logged in to delete!");
        return;
    }
    
    // TODO: WORK WITH AUTHENTICATION
    var obj = request.body;
    // data for the sql query
    var data = [obj.d, obj.c];

    // if somehow you're trying to delete another club's data
    if(identity.club != obj.c){
        console.log("Club: " + identity.club + ", Input: " + obj.c + " mismatch!");
        response.send("You're not authorized to delete that club's event.");
        return;
    }
    deleteEvent(response, obj.d, obj.c);
    response.send("Successfully deleted.");
})


// handles an edit request from an authenticated user
// body has two fields: date and club
app.post('/edit', (request, response) => {
    // authenticate 
    var identity = auth.identity(request);
    if(identity == null) {
        console.log("Failed attempt to delete events!");
        response.send("You need to be logged in to delete!");
        return;
    }
    
    var obj = request.body;
    var club = identity.club;
    // a SINGLE date string (important!)
    var date = obj.d;
    var netID = identity.netID;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;

    var newRow = [club, date, netID, post_date, status, info];
    var query = postQuery + placeholders;
    
    var del = deleteEvent(response, date, club);
    if(del == 1){
        addEvent(response, query, newRow);
        response.send("Successfully edited row");
    } else {
        response.send("Failed to add row");
    }
})

// deletes an event given a date and a club
function deleteEvent(response, date, club){
    db.run(deleteEventsQuery, [date, club], function(err){
        if(err){ 
            response.status(500);
            response.send("Error querying the database");
            console.log(err);
            //return -1;
        } else {
            console.log("Deleted: " + this.changes);
            //return("Deleted " + this.changes + " rows(s).");
        }
    });
    return 1;
}

// adds events, called by /officer_post and /edit
// query is the base add event query but with many placeholders
// data being an array of 'data' for the placeholders
function addEvent(response, query, data){
    db.run(query, data, function(err){
        if(err){ 
            response.status(500);
            response.send("Error editing the database");
            console.log(err);
        } else {
            console.log("Added: " + this.changes);
        }
    });
    return 1;
}

// returns the current time in our format
function currentDate(){
    var dt = dateTime.create();
    return dt.format('m/d/Y');
}
