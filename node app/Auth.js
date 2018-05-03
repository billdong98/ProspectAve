const https = require('https');


// verifies the ticketID passed back to /login via CAS
const serviceURL = 'https://prospectave.io/redirect/';
function verify(ticketID, callback){
    console.log("Verifying");
    //console.log(`https://fed.princeton.edu/cas/validate?service=${serviceURL}&ticket=${ticketID}`);
    let validateURL = `https://fed.princeton.edu/cas/validate?service=${serviceURL}&ticket=${ticketID}`
    https.get(validateURL,
              (res,d)=>
              {
        let body = "";
        res.setEncoding("utf8");
        res.on('data',(d) => {body+=d})
        res.on('end', ()=>{
            let answer = body.split('\n');
            if (answer[0] == 'no'){
                callback(false);
            }
            callback(answer[1]); //return netID
        })}).on('error',console.log);
}


//const serviceURL = 'https://localhost:1738/login';

function redirect(response){
    response.writeHead(301,
                       {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/redirect/`}
                      );
    response.end();
}


function redirectOfficer(response){
    console.log("Redirecting to officer page.");
    response.writeHead(301,
                       {Location: `https://fed.princeton.edu/cas/login?service=https://prospectave.io/officer.html`}
                      );
    response.end();
}

function redirectFailedAttempt(response){
    response.writeHead(301,
                       {Location: `https://prospectave.io/failed_login.html`});
    response.end();
}

const mapping = {
    // Test
    "mman" : "Cap",
    "wzdong" : "Tower",
    "junep" : "Cloister",
    "yangt" : "Cap",
    "bliang" : "Cloister",
    
    // ACTUAL OFFICERS
    // Charter
    "sbelt": "Charter",
    "cbobrien": "Charter",
    
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
    
    // Colonial
    "wdkelly": "Colonial",
    "kap3": "Colonial",
    "gkwon": "Colonial",
    
    // Quad
    "sspergel": "Quadrangle",
    "tdatta": "Quadrangle",
    "nwedel": "Quadrangle",
    "kevin.finch":"Quadrangle",

    // Tiger Inn
    "mm40": "Tiger Inn",
    "crv2": "Tiger Inn",
    
    // Tower
    "rachellm": "Tower",
    "eans": "Tower",
    "tthong": "Tower",
    
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
    "ryancw": "Cottage"
    
    // Ivy
    // unknown
}

function getClub(netID){
    return mapping[netID];
}


// returns an identity object
// if the user is not logged in, return a null identity
function identity(request){
    if (!request.session.isPopulated){
        return null;
    }
    var identity = {netID: request.session.id, club: mapping[request.session.id]};
    return identity;
}


module.exports = {
    redirect : function(res){ redirect(res)},
    verify: function(ticketID, callback){verify(ticketID, callback)},
    redirectOfficer: function(res){ redirectOfficer(res)},
    getClub: function(netID){return getClub(netID)},
    identity: function(request){return identity(request)},
    redirectFailedAttempt: function(res){redirectFailedAttempt(res)}
}


