const fs = require('fs');
const nodemailer = require('nodemailer');
const yargs = require('yargs');

const argv = yargs
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
    .help()
    .alias('help', 'h')
    .argv;


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

function checkPath(path) {
  if(!path) {
    console.log('Missing the file parameter');
  }

  try {
    if (fs.existsSync(path)) {
    }
  } catch(err) {
    console.error(err)
    return 0;
  }
}

function readJson(path) {
  let rawdata = fs.readFileSync(path);
  let obj = JSON.parse(rawdata);
  console.log(obj);
  return obj;
}

function checkInputs() {
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


// Main
var [gameSetUp, emails] = checkInputs();

// Assigned roles to persons(e-mails)
var shuffledEmails = emails;
for (i = 0; i < emails.length / 2 ; i++) {
  shuffledEmails = shuffledEmails.sort(() => Math.random() - 0.5);
}

var characters = [];
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

// Generated additional info a certain character can have
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

// Create reports to emails
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
