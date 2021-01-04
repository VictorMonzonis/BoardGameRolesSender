# BoardGameRolesSender
Assign to emails for automatic board games roles, with the extended info needed

its needen to allow low security access to your account
https://support.reolink.com/hc/en-us/articles/360003525833-How-to-Allow-Less-Secure-Apps-to-Access-Your-G-mail-Account
https://support.google.com/mail/thread/34079846?hl=en

example of use:
node .\sendroles -g '.\BoardGamesSetup\SecretHConfig.json' -e '.\emailList.json' -o sender@mail.com -p passwordforsender
