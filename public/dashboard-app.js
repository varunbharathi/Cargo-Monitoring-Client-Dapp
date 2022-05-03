var firebaseConfig = {
    apiKey: "AIzaSyDOeFISySUxP2o3rjoJBTqGHCHPdY1tUyg",
    authDomain: "cargo-monitoring-7426f.firebaseapp.com",
    projectId: "cargo-monitoring-7426f",
    storageBucket: "cargo-monitoring-7426f.appspot.com",
    messagingSenderId: "851818623554",
    appId: "1:851818623554:web:2ec3c314306f1badff33db",
    measurementId: "G-9XMND63WMP"
};



firebase.initializeApp(firebaseConfig);

var perf=firebase.performance();

var db = firebase.firestore();
var user_emailId;
var currCargo;

var blockchaindata;
var innerHTMLcontent1;

const threshold_form=document.getElementById("threshold-form");
threshold_form.style.visibility='hidden'


const content=document.querySelector('#content-body');
const heading=document.querySelector("#heading");
const tempChart=document.querySelector('#temperatureChart');
const humidityChart=document.querySelector("#humidityChart");
const maps=document.querySelector("#maps");
const formtemp=document.getElementById("tempThreshold");
const formhumi=document.getElementById("humiThreshold");
const button=document.getElementById("Button");
current_threshold_text=document.getElementById("current-threshold-text");
// const tempplotHeading=document.querySelector('#tempplotHeading');
// const humidityplotHeading=document.querySelector('#humidityplotHeading');
// const mapsHeading=document.querySelector('#mapsHeading');
 
checkAuthState();

function checkAuthState(){
    firebase.auth().onAuthStateChanged(user=>{
      if(user){
        console.log("Logged in");
        console.log(user);
        loadUserInfo(user);
      }else{
        console.log("Some Error has Occured User not logged in!");
        window.location.replace("index.html");
      }
    })
  }




  function LogoutUser(){
    console.log('Logout Btn Call')
    firebase.auth().signOut().then(()=>{
      console.log("User Logged Out!");
      window.location.replace("index.html");
    }).catch(e=>{
      console.log(e)
    })
  }

  //loading user info to dashboard
  function loadUserInfo(user)
  {
    var user_name=document.querySelector("#user-name");
    var user_photo=document.querySelector('#user-photo');
    var user_email=document.querySelector('#user-email');
    
    user_emailId=`${user.email}`;
     

    user_name.innerText=`${user.displayName} `;
    user_photo.src=`${user.photoURL}`;
    user_email.innerText=`${user.email} (Admin)`;

    db.collection("users").doc(`${user.email}`).get().then((doc)=>{
      if(doc.exists)
      {
        console.log("user found!");
      }
      else 
      {
        console.log("Document Not found..");
        console.log("entering new Document..");
        
        //adding new data

        db.collection("users").doc(`${user.email}`).set({
          uid: user.uid,
          given_name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
      })
      .then(() => {
          console.log("Document successfully written!");
      })
      .catch((error) => {
          console.error("Error writing document: ", error);
      });


      }
    }).catch((error) => {
      console.log("Error getting document: ", error);
    });



//     content.innerHTML= 
// `<h1> this is the start</h1>
//       <h1> The Name is ${user.displayName} </h1>
//       <h1> ${user.email} </h1> 
//       <img src="${user.photoURL}">
//       <h1>${user.uid}</h1>`
     

   showCardsOnDashboardClick();
  }


  //put all your functions here



let innerHTMLContent= `
<h1 id="dashboardh1"> Your Cargo Tracking Modules </h1>
<div class="row">`;



async function showCardsOnDashboardClick(){

  threshold_form.style.visibility='hidden';
heading.innerHTML="";
humidityChart.innerHTML="";
tempChart.innerHTML="";
maps.innerHTML="";

content.innerHTML="";
// tempplotHeading.innerHTML="";
// humidityplotHeading.innerHTML="";
// mapsHeading.innerHTML="";
  
  innerHTMLContent= ` <h1 id="dashboardh1"> Your Cargo Tracking Modules </h1> <div class="row">`;

  await db.collection("cargos").where("owner", "==", "jkvarun7@gmail.com")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            addCard(doc.id);
           
            
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    
    
    innerHTMLContent=innerHTMLContent.concat(`<div>`);
    content.innerHTML=innerHTMLContent;
    
     
}

  function addCard(cargoName)
{
  let cardElement= `
  <div class="col-sm-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${cargoName}</h5>
            <p class="card-text">This is a cargo monitoring module registered in your account</p>
            <a href="#" onclick="cargoAnalytics('${cargoName}')" class="btn btn-secondary">View Analytics</a>
          </div>
        </div>
      </div>`;

  innerHTMLContent=innerHTMLContent.concat(cardElement);
}

 async function cargoAnalytics(cargo)
{

  content.innerHTML="";
  //query specific cargo data from db data from DB

  //writting the cargo heading
 
  heading.innerHTML= `<h1 class="text-center"> Analytics for ${cargo}  (Cargo Status : <span id=status>Updating...</span>)</h1>`

  //writing the cargo-analytics-content

  


var timeSeries=new Array();
var temperature=new Array();
var humidity=new Array();
var temp;
var latitude;
var longitude;

var cargos=db.collection('cargos').doc(`${cargo}`).collection("data");
await cargos.orderBy("timestamp","desc").limit(10).get()
.then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      temp=doc.data().timestamp;
      temp=temp.replaceAll("/","-");
      timeSeries.push(temp);
      temperature.push(doc.data().temperature);
      humidity.push(doc.data().humidity);
      latitude=doc.data().latitude;
      longitude=doc.data().longitude;
  });
})
.catch((error) => {
  console.log("Error getting documents: ", error);
});


console.log(latitude,longitude);

maps.innerHTML=`<iframe src="https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed" width="80%" height="500" frameborder="0" style="border:0">`;


//drawing a temperature chart


timeSeries=timeSeries.reverse();
temperature=temperature.reverse();
humidity=humidity.reverse();

var data = [
  {
    x: timeSeries,
    y: temperature,
    type: 'scatter',
    mode:"lines"
  }
];

var layout={
  xaxis: {title: "Time and Date"},
yaxis: {title: "Temperature"},  
title: "Time vs. Temperature"
}


//drawing a humidity chart

var xArray = [22,22,22,22];
var yArray = [1,2,3,4];


// Define Data
var data1 = [{
  x:timeSeries,
  y:humidity,
  type:"scatter",
  mode:"lines"
}];

// Define Layout
// var layout = {
//   xaxis: {range: [40, 160], title: "Time and Date"},
//   yaxis: {range: [5, 16], title: "Humidity"},  
//   title: "Time vs. Humidity"
// };

var layout1={
    xaxis: {title: "Time and Date"},
  yaxis: {title: "Humidity"},  
  title: "Time vs. Humidity"
}
// Display using Plotly
Plotly.newPlot(document.querySelector('#temperatureChart'), data, layout);
Plotly.newPlot(document.querySelector('#humidityChart'), data1, layout1);

console.log(xArray);


threshold_form.style.visibility='visible';
currCargo=cargo;
button.setAttribute('onclick', `setThreshold()`);

var docRef = db.collection("cargos").doc(cargo);
docRef.get().then((doc) => {
  if ((doc.data().humiThreshold!="None" || doc.data().tempThreshold)!="None" ) {
      current_threshold_text.innerHTML= `Threshold at ${doc.data().humiThreshold}C and ${doc.data().tempThreshold}%`;

  } else {
      // doc.data() will be undefined in this case
      current_threshold_text.innerHTML="Please set Threshold";
  }
}).catch((error) => {
  console.log("Error getting document:", error);
});

checkSecure();

}



async function setThreshold()
{

   
  var setTemp=parseInt(formtemp.value);
  var setHumi=parseInt(formhumi.value);
   console.log(setTemp,setHumi);
if(setTemp && setHumi)
{
   db.collection("cargos").doc(`${currCargo}`).set({
    owner:user_emailId,
    tempThreshold: setTemp,
    humiThreshold: setHumi
})
.then(() => {
    console.log("Document successfully written!");
})
.catch((error) => {
    console.error("Error writing document: ", error);
});
}
else{
  console.log("enter some value!!");
}

current_threshold_text.innerHTML= `Threshold at ${setTemp}°C and ${setHumi}%`;

checkSecure();
}


async function checkSecure()
{
  var thTemp;
  var thHumi;
  var currTemp;
  var currHumi;



  var docRef = db.collection("cargos").doc(currCargo);
await docRef.get().then((doc) => {
  if (doc.data().humiThreshold!="None" || doc.data().tempThreshold!="None") {
      thTemp=doc.data().humiThreshold;
      thHumi=doc.data().tempThreshold;
  } else{
      // doc.data() will be undefined in this case
      current_threshold_text.innerHTML="Please set Threshold";
  }
}).catch((error) => {
  console.log("Error getting document:", error);
});

await docRef.collection("data").orderBy("timestamp", "desc").limit(1).get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            currTemp=doc.data().temperature;
            currHumi=doc.data().humidity;
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });

    if(currHumi>thHumi || currTemp>thTemp)
    {
      heading.innerHTML= `<h1 class="text-center"> Analytics for ${currCargo}  (Cargo Status : <span class="text-danger" id=status>UnSecure</span>)</h1>`;
    }
    else{
      heading.innerHTML= `<h1 class="text-center"> Analytics for ${currCargo}  (Cargo Status : <span class="text-success" id=status>Secure</span>)</h1>`;
    }
    console.log(currTemp,currHumi);

}

async function showCardsOnAlertDashboardClick()
{

  console.log("Inside the function");

  threshold_form.style.visibility='hidden';
  heading.innerHTML="";
  humidityChart.innerHTML="";
  tempChart.innerHTML="";
  maps.innerHTML="";
  
  content.innerHTML="";

  innerHTMLContent= ` <h1 id="dashboardh1"> Your Cargo Tracking Modules with Only Alert Data </h1> <div class="row">`;

  await db.collection("cargos").where("owner", "==", user_emailId)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            addCardBC(doc.id);
           
            
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    
    
    innerHTMLContent=innerHTMLContent.concat(`<div>`);
    content.innerHTML=innerHTMLContent;

  await fetchJSON();



}


  function addCardBC(cargoName)
{
  let cardElement= `
  <div class="col-sm-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${cargoName}</h5>
            <p class="card-text">This is a cargo monitoring module registered in your account</p>
            <a href="#" onclick="showAlertData('${cargoName}')" class="btn btn-danger">View Alert History</a>
          </div>
        </div>
      </div>`;

  innerHTMLContent=innerHTMLContent.concat(cardElement);
}

async function fetchJSON()
{
console.log(blockchaindata);
var apikey=8296576590265498;

const API_call_trace = trace (perf ,"Blockchain Call Trace");

API_call_trace.start();

fetch('https://nodejs-fetch-api.herokuapp.com/fetchData', {
  method: "GET",
  headers: {"Content-type": "application/json;charset=UTF-8","email": user_emailId, "apikey": apikey }
})
.then(response => response.json())
.then(data => blockchaindata=data )
.catch(err => console.log(err));

API_call_trace.stop();

}

function showAlertData(cargo)
{

  threshold_form.style.visibility='hidden';
  heading.innerHTML="";
  humidityChart.innerHTML="";
  tempChart.innerHTML="";
  maps.innerHTML="";
  
  content.innerHTML="";

 innerHTMLcontent1="";
heading.innerHTML=`Your data for ${cargo} are below:`;

  if(blockchaindata)
  {
  blockchaindata.forEach((Element, index) =>{

       if(Element.cargoId==cargo)
       {
         innerHTMLcontent1= innerHTMLcontent1.concat(`<p>${JSON.stringify(Element)}</p>`);

      }

  });

  if(innerHTMLcontent1=="")
  {
    innerHTMLcontent1=`<h3 style="color:blue;"> You have No alerts in this cargo yet! </h3>`;
   
  }
}


content.innerHTML=innerHTMLcontent1;


}