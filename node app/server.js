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

var whitelist = ['https://prospectave.io', 'http://localhost', 'https://prospectave.io:1738', 'http://127.0.0.1', 'null']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
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


let corsCred = cors({credentials:true, origin: 'https://prospectave.io'});
 
app.options('/officer_download', corsCred);

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


/* QUERIES */
// gets all records from club_status
let selectAll = 'SELECT * FROM club_status ORDER BY date';
// [(club_name, date, poster, post_date, status, info)]
let post = 'INSERT INTO club_status VALUES ';
let placeholders = '(?,?,?,?,?,?)';
let selectByClub = 'SELECT * FROM club_status WHERE club_name = ?  ORDER BY date';


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


/* clears the DB */
app.get('/clear', (request, response) => { 
    console.log('CLEARING DB');

    db.run("DELETE from club_status", [], (err, result) => {
        if(err){
            throw err;
        }

        console.log(result);
        response.send(result);
    });
})

app.get('/login', (request, response) => { 
    console.log('Login');
    
    var callback = function(result){
            if(result != false){
                request.session.id = result;
                console.log("Created cookie for: " + request.session.id);
                auth.redirectOfficer(response);
                return;
            } else {
                response.status(500);
                response.send("Bad auth token.");
            }
        }.bind({request: request, response: response});
    
    if(request.session.isPopulated) {
        console.log("Already logged in");
        console.log(`Redirecting: ${request.session.id}`);
        auth.redirectOfficer(response);
        // redirect to officer page
        return;
    }
    
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
app.get('/officer_download', corsCred, (request, response) => { 
    response.setHeader('Content-Type', 'application/json');
        
    var identity = {netID: null, club: null};
    
    if(!request.session.isPopulated) {
        console.log("Failed attempt to get club data");
        response.json({"identity": null, "rows": null});
        return;
    } else {
        // return club data
        identity.netID = request.session.id;
        identity.club = auth.getClub(identity.netID);
        
        var data = {"identity": identity, "rows" : null};
        
        console.log("Sending data for (" + identity.netID + ", club: " + identity.club);
        
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
    var obj = request.body;
    // IMPLEMENT THIS FOR JSON ARRAY LATER
    console.log(obj);
    var club = obj.c;
    var dates = obj.d;
    var netID = obj.p;
    var status = obj.s;
    var post_date = currentDate();
    var info = obj.i;

    var data = [];
    var query = post;

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

    db.run(query, data, (err)=>{
        if(err){ 
            response.status(500);
            response.send("ERROR");
            console.log(err);
        } else {
            console.log("CHANGED: " + this.changes);
            response.send("Ok.");
        }
    });
})


// returns the current time in 
function currentDate(){
    var dt = dateTime.create();
    return dt.format('m/d/Y');
}
