# Project Title 
 ##  Student-Sphere:A mobile application that aggregates student learning activities
# Project Description
- This is a mobile student companion application that aggregates student learning activities.Its aim is to make access to learning resources easier and to enhance student's time management by providing a student-based task manager and reduce time wastage by aggregating student resources.

# Project Setup/Installation instructions
- In order to use this application,you need to ensure that you have the Node LTS(Long Term Support) version and Expo installed on your computer.
 
## List of dependencies
- [React native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/get-started/introduction/)
- [Node Js](https://nodejs.org/en/download/package-manager)-Download Latest LTS(Long Term Support) version for your operation system

 # Usage Instructions
## 1)  Setup repositiory in folder of your choice
```
cd folder_of_your_choice/
git clone https://github.com/SMK-008/Student-Sphere.git
```
## 2) Start the server
```
cd main-project/
npx expo start
```
- In the terminal,the output will show a list of commands and a QR code.
## 3) Opening app on mobile device
### i)Scanning
- Open your phones camera app and scan the QR code.
### ii) Open emulator through terminal
#### a) IOS
- Click "I" on the terminal.
#### b) Android
- Click "a" on the terminal
## 4) End server
- Click "Ctrl + C" on the terminal


 ## How to run
 - Ensure you navigate into the main-project directory.
 ```
 cd main-project
npx expo start
 ```
 - You will see a QR code in the output of the previous command.
 - Open the camera app of your mobile device and point it towards the QR code(make sure your camera is able to view the entire barcode).
 
 To close the server,Type CTRL + C.

## Examples

## Input/Output
### Input
- The application takes in multiple types of inputs depending on the different modules:
##### Authentication Module
Takes in user's name,password,user's role and phone number.
##### Task management module
Takes in deadline,task weight,title and description.
##### Announcement's module
Takes in images,description and URL.
##### Unit's module
Takes in File,description text,Title text.

### Output
- The authentication module's output is access to the user's account and application features
- The unit's module's output involves downloading files posted.
- The task management module is the user being able to manage their time 
# Project Structure

```
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
```
## License
MIT