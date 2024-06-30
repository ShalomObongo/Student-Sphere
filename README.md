# Project Title 
 student-Sphere
# Project Description
- This is a mobile student companion application that aggregates student learning activities.Its aim is to make access to learning resources easier and to enhance student's time management by providing a student-based task manager and reduce time wastage by aggregating student resources.

# Project Setup/Installation instructions
- In order to use this application,you need to ensure that you have the Node LTS(Long Term Support) version and Expo installed on your computer.
## Node JS installation


## Visual Studio Code installation


 ## Expo installation
 ### On computer 

 ### On phone
 #### Steps on Android
- On your Android device, go to Play Store.
- Search for the Expo Go app.
- Download it.
- After the download is complete,open the application.
- Inorder to be able to run your application,you will be asked to create an Expo account.




 #### Steps on IOS 
 


 ## Repositiory setup
 - Create an empty folder anywhere on your computer and Name it "Application".
 - Open Visual Studio Code.
 - Open the "Application folder" in using Visual Studio Code.
 - Open the Integrated Terminal (Press Ctrl+` keys or In the top menu bar,click on View then click on Terminal).
 - Type  "git clone https://github.com/SMK-008/Student-Sphere.git" in the terminal and press enter.

 # Usage instructions
 ## How to run
 - On the terminal,type "npx expo start".
 - You will see a QR code in the output of the previous command.
 - Open the camera app of your mobile device and point it towards the QR code(make sure your camera is able to view the entire barcode).
## Examples

## Input/Output


# Project Structure
<!-- Student-Sphere/
|__ .expo/
|__ main-project/
|    |__ .expo/
|    |__ .idea/
|    |__ assets/                                # This folder holds all the images that are used in this project
|    |__ node_modules/                          # This holds all the node modules necessary for this project        
|    |__ screens/                               # This folders holds screens that the user uses to interact witht the application
|    |    |__ Announcements.js                  # Script showing the user's class and general announcements 
|    |    |__ DashboardScreen.js                # First screen showed after the user logs into the application 
|    |    |__ EditProfile.js                    # Screen for the user to edit their own details
|    |    |__ HomeScreen.js                     # First screen when app is loaded.
|    |    |__ LoginScreen.js                    # Login page
|    |    |__ ProfileScreen.js                  # User can view the details from here
|    |    |__ RegistrationScreen.js             # Signup page
|    |    |__ resetPwd.js                       # Reset Password page from the Profile Screen
|    |    |__ taskscreen.js                     # Task management screen
|    |    |__ Units.js                          # Displays the user's Units
|    |    |__ unitscreen.js                     #  
|    |    |__ UnitView.js                       # User can view the unit's course content
|    |    |__ViewAnnouncements.js               # User can view more information about a particular announcement
|    |
|    |__ .gitignore                             # Files excluded from Git tracking
|    |__ App.js                                 # Serves as entry point of application
|    |__ app.json                               # Config file that holds metadata about the application
|    |__ babel.config.js                        # Responsible for configuring Babel
|    |__ firebase.js                            # Holds configuration information for the Project's Firebase database
|    |__ package-lock.json                      #
|    |__ package.json                           #
|
|__ node_modules/                                #
|__ package-lock.json                           #
|__ package.json                                #
|__ README.md                                   # Holds this project's documentation -->





Student-Sphere/
├── main-project
│   ├── App.js                                  # Serves as entry point of application
│   ├── app.json                                # Config file that holds metadata about the application
│   ├── assets                                  # This folder holds all the images that are used in this project
│   ├── babel.config.js                         # Responsible for configuring Babel    
│   ├── firebase.js                             # Holds configuration information for the Project's Firebase database
│   ├── package.json                            # List the dependencies and scripts needed for the project
│   ├── package-lock.json                       # Captures exact versions of packages and dependencies
│   └── screens                                 # Contains screens that the user uses to interact witht the application
├── package.json                                #Lists the expo dependencies needed for the project
├── package-lock.json                           # Captures exact versions of Expo dependencies
└── README.md                                   # Holds the project's documentation 

