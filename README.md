# BoardGameRolesSender
Assign to emails for automatic board games roles, with the extended info needed

it's needen to allow low security access to your account
https://support.reolink.com/hc/en-us/articles/360003525833-How-to-Allow-Less-Secure-Apps-to-Access-Your-G-mail-Account
https://support.google.com/mail/thread/34079846?hl=en


example of use:
node .\sendroles -g '.\BoardGamesSetup\SecretHConfig.json' -e '.\emailList.json' -o sender@mail.com -p passwordforsender



Can be adapt the code to OAuth2 authantication, check sendroles.js code and visit the following links as a guidence
https://console.cloud.google.com/apis/dashboard
https://developers.google.com/oauthplayground/

Some explanations about how to adapt the code https://www.youtube.com/watch?v=JJ44WA_eV8E
