Vaccination Status
---------

1. Ensure that NodeJS and MongoDB are installed on your system. More OS/system specific information and resources can be obtained from their official websites : 
[NodeJS](https://nodejs.org/en/download/) and 
[MongoDB](https://docs.mongodb.com/manual/administration/install-community/) 

2. Start up the MongoDB server (this is also OS specific, instructions are provided at the same link above) so that the database is online (By default, at the URL `localhost:27017`).

3. *This step is not essential* <br>
Open the top-level directory of our project in which the code files are present (`app.js`, etc) and create a `.env` file here if it doesn't exist. This is just used to store the authentication details for sending an email (key : `mailPASS`), and an alternate (remote) database link (key : `PASS`), if the localhost installation is not used. 

4. Run ```node app.js``` from the system command-line/terminal.
