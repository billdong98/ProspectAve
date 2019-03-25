// require the sqlite module
const sqlite3 = require('sqlite3').verbose();

/* SQLITE QUERIES */
// insert a new row into the database
// [(club_name, date, poster, post_date, status, info)]
let postQuery = 'INSERT INTO club_status VALUES ';
let placeholders = '(?,?,?,?,?,?,?)';
// part of a query

//let afterToday = "DATE(substr(date,7,4)||'-'||substr(date,1,2)||'-'||substr(date,4,2)) >= date('now','localtime', '-4 hours')";
//let selectPast = "SELECT * FROM club_status WHERE DATE(substr(date,7,4)||'-'||substr(date,1,2)||'-'||substr(date,4,2)) < date('now','localtime', '-4 hours') ORDER BY date";

// gets all records from club_status after today
let selectAll = 'SELECT * FROM club_status ORDER BY DATE(substr(date,7,4)||"-"||substr(date,1,2)||"-"||substr(date,4,2))';
// get records from club_status for a particular club (after today)
let selectByClub = 'SELECT * FROM club_status WHERE club_name = ? ORDER BY DATE(substr(date,7,4)||"-"||substr(date,1,2)||"-"||substr(date,4,2))';
// delete a given event (club and date needed) 
let deleteEventsQuery = 'DELETE from club_status WHERE date = ? and club_name = ?';

/* AUTH management */
let selectAllAuth = 'SELECT * FROM auth ORDER BY club';
let addAuth = 'INSERT INTO AUTH (netid, club) VALUES(?,?)';
let deleteAuth = 'DELETE from AUTH WHERE netid = ?';

/* AUTHENTICATION */
const checkQuery = "SELECT club FROM auth WHERE netid = ?";

// connect to the db file
let dbInstance = new sqlite3.Database('./clubs.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite DB.');
});


dbInstance.allAsync = function (sql) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.all(sql, function (err, rows) {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};

dbInstance.allParamsAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.all(sql, params, function (err, rows) {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};

dbInstance.runAsync = function (sql, params) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.run(sql, params, function(err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    })
};


module.exports = {
    allParamsAsync : function(sql, params){ return dbInstance.allParamsAsync(sql, params)},
    runAsync : function(sql, params){ return dbInstance.runAsync(sql, params)},
    allAsync: function(sql){ return dbInstance.allAsync(sql)},
    postQuery: postQuery,
    placeholders: placeholders,
    selectAll : selectAll,
    selectByClub: selectByClub,
    deleteEventsQuery: deleteEventsQuery,
    selectAllAuth: selectAllAuth,
    addAuth: addAuth,
    deleteAuth: deleteAuth,
    checkQuery: checkQuery
}


