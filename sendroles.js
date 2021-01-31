const fs = require('fs');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
const { exit } = require('process');
const yargs = require('yargs');

function argsSetup(){
  return yargs
    .usage("Usage: $0 -g gameFile -e mailFiles")
    .example(
        "$0 -g gameFile.json -m mailFiles.json",
        "Send and email to each player with the info their need to know about the game \n\n"
        +"Config Files wild chars: \n"
        +"+Role modifiers: Keep a role that will be decodified when generating the report e.g. 'Roles':['[base64]QmFkR3V5'] the value 'QmFkR3V5' will be recived in the email as 'BadGuy' this do not impact the KnowRoles,"
        +"can be handy in some games where all the character with BadGuy ust be knwown for a player but one, (another trick is to use Zero Space With chars in the meddle). \n"
        +"+Name modifier: expresions like[x] e.g. 'Name':'GoodGuy[x]' will be enriched in the email like GoodGuy1, GoodGuy2...different number for each player"
      )
    .option('game', {
        alias: 'g',
        description: 'Config with the game roles',
        type: 'path file',
    })
    .option('emails', {
      alias: 'e',
      description: 'List with all the emails to send a role',
      type: 'path file',
    })
    .option('emailsender', {
      alias: 'o',
      description: 'The email you want to use to send the emails',
      type: 'valid email adress',
    })
    .option('emailsenderpassword', {
      alias: 'p',
      description: 'The email password bind to emailsender',
      type: 'valid email passw',
    })
    .help()
    .alias('help', 'h')
    .argv;
}

function readJson(path) {
  let rawdata = fs.readFileSync(path);
  let obj = JSON.parse(rawdata);
  console.log(obj);
  return obj;
}

var checkInputs = function() {
  let gameSetUp = readJson(argv.game);
  let emails = readJson(argv.emails);

  let wellFormatted = gameSetUp.every(e => e.Number) && gameSetUp.every(e => e.Roles) && gameSetUp.every(e => e.Name)
  if(!wellFormatted) {
    console.error('Name, Role and Number must be defined');
    process.exit(0);
  }

  const totalRoles = gameSetUp.reduce((a, b) => parseInt(a) + parseInt(b.Number), 0);
  if(totalRoles != emails.length) {
    console.error(`The number of roles: ${totalRoles} to be assign is diferent than the number of mails ${emails.length}`);
    process.exit(0);
  }

  return [gameSetUp, emails];
}

// Assigned characters to players(e-mails)
var shuffleArray = function(array) {
  var [...arrayclone] = [...array];

  for (i = 0; i < arrayclone.length / 2 ; i++) {
    arrayclone = arrayclone.sort(() => Math.random() - 0.5);
  }

  return arrayclone;
}

var assignCharacters = function(gameSetUp, shuffledEmails){
  let characters = [];
  shuffledEmailsIndex = 0;
  for (i = 0; i < gameSetUp.length ; i++) {
    let charConfig = gameSetUp[i];

    for (j = 0; j < charConfig.Number ; j++) {
      characters.push(
        {
          "Name": charConfig.Name.replace("[x]", j),
          "Roles": charConfig.Roles,
          "KnowRoles": charConfig.KnowRoles || [],
          "SendTo":shuffledEmails[shuffledEmailsIndex].mail,
          "PlayerAka":shuffledEmails[shuffledEmailsIndex].aka,
          "EnrichedInfo":""
        }
      )
      shuffledEmailsIndex++;
    }
  }

  return characters;
}

// Generated additional info a certain character can have
var enrichCharacters = function(characters){
  console.log("_Adding extra information to special characters if needed");
  for (i = 0; i < characters.length ; i++) {
    let character = characters[i];
    if(character.KnowRoles.length > 0)
      console.log(`\t Char with Name ${character.Name} knows` );

    character.KnowRoles.forEach( lookForRole => {
      // check if a specific role is in the roles lists of a character
      let people = characters.filter(e => e.Roles.includes(lookForRole)); 

      people.forEach( person => {
        console.log(`\t\t About who is the rol of ${person.Name}` );
        character.EnrichedInfo += ` PlayerAka: '${person.PlayerAka}', With Role: '${lookForRole}' -- \n`;
      });
    });
  }

  return characters;
}

var decodeBase64 = function(strInput){
  if(strInput.includes('[base64]')){
    return Buffer.from(strInput.replace("[base64]", ""),'base64').toString('ascii');
  }

  return strInput;
}


// Create reports to emails
var generateReports = function(characters, transporter){
  let gameId = Math.floor((Math.random() * 1000) + 1);
  console.log(`_Create Reorts of gameId ${gameId}:`);
  for (i in characters) {
    let character = characters[i];
  
    character.Roles = character.Roles.map(r => decodeBase64(r)); // If contains not redable content 'base64' it's time to decode it

    let bodyText = ` ** GameId ${gameId} ** Your Char Name: '${character.Name}', Roles: '${character.Roles.toString()}', Aka: '${character.PlayerAka}' ** \n\n`;
    bodyText += character.EnrichedInfo
  
    let mailOptions = {
      from: 'rolesdealer@gmail.com',
      to: character.SendTo,
      subject: 'OnlineGame',
      text: bodyText
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    console.log(`\t Sended to ${character.SendTo}`);
  }
}

module.exports = {
  checkInputs,
  shuffleArray,
  assignCharacters,
  enrichCharacters,
  decodeBase64
}


// Main
if(process.argv.slice(2).length == 0 || process.argv.slice(2)[0].includes('Tests/'))
  return; // prevents execution when the script is loaded by the test.

const argv = argsSetup();
var [gameSetUp, emails] = checkInputs();
var shuffledEmails = shuffleArray(emails);
var characters = assignCharacters(gameSetUp, shuffledEmails);
characters = enrichCharacters(characters);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: argv.emailsender,
    pass: argv.emailsenderpassword
  }
});

// If you want to use OAut2 auteritzation uncomment the following lines fill the correspondind values, and comment the precious smtp trasnporter assignation
// var transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//     auth: {
//       type: 'OAuth2',
//       user: argv.emailsender,
//       clientId: '413886217059-74lrrrkkiqjch0qes6ep5gts0oiefj2s.apps.googleusercontent.com',
//       clientSecret: 'YiAXXXXXXXXXXXXXXXX',
//       refreshToken: '1//04dkhufldLQwUXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//       //accessToken: 'ya29.a0AfH6SMCZEEi3EN374qTUeDccXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX05M3b9LMFpJTv4778_tTgFi8n6clnZzc' //work without it
//     }
// });

generateReports(characters, transporter);
