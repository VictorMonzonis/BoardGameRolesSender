const fs = require('fs');
const nodemailer = require('nodemailer');
const yargs = require('yargs');

function argsSetup(){
  return yargs
    .usage("Usage: $0 -g gameFile -e mailFiles")
    .example(
        "$0 -g gameFile.json -m mailFiles.json",
        "Send and email to each player with the info their need to know about the game"
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

module.exports.checkInputs = function() {
  let gameSetUp = readJson(argv.game);
  let emails = readJson(argv.emails);

  let wellFormatted = gameSetUp.every(e => e.Number) && gameSetUp.every(e => e.Role) && gameSetUp.every(e => e.Name)
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

// Assigned roles to persons(e-mails)
module.exports.shuffleArray = function(array) {
  var [...arrayclone] = [...array];

  for (i = 0; i < arrayclone.length / 2 ; i++) {
    arrayclone = arrayclone.sort(() => Math.random() - 0.5);
  }

  return arrayclone;
}

module.exports.assignCharacters = function(gameSetUp, shuffledEmails){
  let characters = [];
  shuffledEmailsIndex = 0;
  for (i = 0; i < gameSetUp.length ; i++) {
    let charConfig = gameSetUp[i];

    for (j = 0; j < charConfig.Number ; j++) {
      characters.push(
        {
          "Name": charConfig.Name.replace("[x]", j),
          "Role": charConfig.Role,
          "KnowRoles": charConfig.KnowRoles || [],
          "SendTo":shuffledEmails[shuffledEmailsIndex].mail,
          "PersonsName":shuffledEmails[shuffledEmailsIndex].aka,
          "EnrichedInfo":""
        }
      )
      shuffledEmailsIndex++;
    }
  }

  return characters;
}

// Generated additional info a certain character can have
module.exports.enrichCharacters = function(characters){
  console.log("_Adding extra information to special characters if needed");
  for (i = 0; i < characters.length ; i++) {
    let character = characters[i];
    if(character.KnowRoles.length > 0)
      console.log(`\t Char with Name ${character.Name} knows` );

    character.KnowRoles.forEach( lookForRole => {
      let people = characters.filter(e => e.Role == lookForRole) ;

      people.forEach( person => {
        console.log(`\t\t about who is ${person.Name}` );
        character.EnrichedInfo += ` PersonsName: ${person.PersonsName}, Role:${person.Role} -- \n`;
      });
    });
  }

  return characters;
}

// Create reports to emails
module.exports.generateReports = function(characters, transporter){
  console.log("_Create Reorts:");
  for (i in characters) {
    let character = characters[i];
  
    let bodyText = ` ** Your Char Name: ${character.Name}, Role ${character.Role}, Aka: ${character.PersonsName} ** \n\n`;
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


// Main
const argv = argsSetup();
var [gameSetUp, emails] = exports.checkInputs();
var shuffledEmails = exports.shuffleArray(emails);
var characters = exports.assignCharacters(gameSetUp, shuffledEmails);
characters = exports.enrichCharacters(characters);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: argv.emailsender,
    pass: argv.emailsenderpassword
  }
});

exports.generateReports(characters, transporter);
