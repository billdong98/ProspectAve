const https = require('https');
const sqlite3 = require('sqlite3');
const db = require('./db.js');

// verifies the ticketID passed back to /login via CAS
const serviceURL = 'https://prospectave.io/redirect/';

function verify(ticketID, callback){
    //console.log("Verifying");
    //console.log(`https://fed.princeton.edu/cas/validate?service=${serviceURL}&ticket=${ticketID}`);
    let validateURL = `https://fed.princeton.edu/cas/validate?service=${serviceURL}&ticket=${ticketID}`
    https.get(validateURL,
      (res,d)=>
      {
        let body = "";
        res.setEncoding("utf8");
        res.on('data',(d) => {body+=d})
        res.on('end', async ()=>{
            let answer = body.split('\n');
            if (answer[0] == 'no'){
                await callback(false);
            }
            await callback(answer[1]); //return netID
        })}).on('error',console.log);
}


//const serviceURL = 'https://localhost:1738/login';

function redirect(response){
    response.writeHead(307,
       {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/redirect/`}
       );
    response.end();
}


async function redirectOfficer(response, netID){
    var club = await getClub(netID);
    if(club == "ADMIN"){
        response.writeHead(307, {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/admin.html`});
    } else {
        response.writeHead(307, {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/officer.html`});
    }
    response.end();
}


function redirectFailedAttempt(response){
    response.writeHead(307,
       {Location: `https://prospectave.io/failed_login.html`});
    response.end();
}

/* Should only EVER be called on login (once per login)*/
async function getClub(netID){
    let rows = await db.allParamsAsync(db.checkQuery, netID);
    if(rows.length == 0) return null;
    var club = rows[0].club;
    return club;
}


// returns an identity object
// if the user is not logged in, return a null identity
function identity(request){
    if (!request.session.isPopulated){
        return null;
    }
    var identity = {netID: request.session.id, club: request.session.club};
    return identity;
}


module.exports = {
    redirect : function(res){ redirect(res)},
    verify: function(ticketID, callback){verify(ticketID, callback)},
    redirectOfficer: function(res, id){ redirectOfficer(res, id)},
    getClub: function(netID){return getClub(netID)},
    identity: function(request){return identity(request)},
    redirectFailedAttempt: function(res){redirectFailedAttempt(res)}
}

/* DEPRECATED MAPPING
const mapping = {
    // ProspectAve team
    "mman" : "ADMIN",
    "wzdong" : "ADMIN",
    "junep" : "ADMIN",
    "yangt" : "ADMIN",
    "bliang" : "ADMIN",
    
    // ACTUAL OFFICERS
    // Charter
    "sbelt": "Charter",
    "cbobrien": "Charter",
    "jpuryear": "Charter",
    
    // Cap
    "eaguas": "Cap",
    "rjh3": "Cap",
    "jpinnock": "Cap",
    
    // Cannon
    "jahaney": "Cannon",
    "ad15": "Cannon",
    "eberbari": "Cannon",
    "declerck": "Cannon",
    
    // Cloister
    "gmiles": "Cloister",
    "raglenn": "Cloister",
    "rswanton": "Cloister",
    "hpaynter": "Cloister",
    "jspiezio": "Cloister",
    "meghancs": "Cloister",
    "thelgaas": "Cloister",
    "astucke": "Cloister",
    "ekeim": "Cloister",
    "kdehejia": "Cloister",
        
    // Colonial
    "wdkelly": "Colonial",
    "kap3": "Colonial",
    "gkwon": "Colonial",
    "kywu": "Colonial",
    "sepowell": "Colonial",
    
    // Quad
    "sspergel": "Quadrangle",
    "reg4": "Quadrangle",
    "tdatta": "Quadrangle",
    "nwedel": "Quadrangle",
    "kfinch":"Quadrangle",
    "dpbell": "Quadrangle",
    "esthomas": "Quadrangle",
    "dpbello": "Quadrangle",
     
    // Tiger Inn
    "mm40": "Tiger Inn",
    "crv2": "Tiger Inn",
    
    // Tower
    "rachellm": "Tower",
    "eans": "Tower",
    "tthong": "Tower",
    "mkuk": "Tower",
    
    // Terrace
    "ecyu": "Terrace",
    "mlecesne": "Terrace",
    "jhileman": "Terrace",
    "alexusf": "Terrace",
    "bdm2": "Terrace",
    "ltw2": "Terrace",
    
    // Cottage
    "cswezey": "Cottage",
    "jnyquist": "Cottage",
    "brookekh": "Cottage",
    "jgcolvin": "Cottage",
    "ryancw": "Cottage",
    
    // Ivy
    "masom": "Ivy",
    "ccb4": "Ivy",
    "helenz": "Ivy"
}*/

