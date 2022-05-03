     var firebaseConfig = {
        apiKey: "AIzaSyDOeFISySUxP2o3rjoJBTqGHCHPdY1tUyg",
        authDomain: "cargo-monitoring-7426f.firebaseapp.com",
        projectId: "cargo-monitoring-7426f",
        storageBucket: "cargo-monitoring-7426f.appspot.com",
        messagingSenderId: "851818623554",
        appId: "1:851818623554:web:2ec3c314306f1badff33db",
        measurementId: "G-9XMND63WMP"
            };
      
      
            // Initialize Firebase
firebase.initializeApp(firebaseConfig);
      

document.getElementById('login').addEventListener('click', GoogleLogin)
         
let provider = new firebase.auth.GoogleAuthProvider()


function GoogleLogin(){
console.log('Login Btn Call')
firebase.auth().signInWithPopup(provider).then(res=>{
console.log(res.user)
window.location.href="dashboard.html";
}).catch(e=>{
            console.log(e)
            })
 }
      
            
//  function showUserDetails(user){
//               document.getElementById('userDetails').innerHTML = `
//                 <img src="${user.photoURL}" style="width:10%">
//                 <p>Name: ${user.displayName}</p>
//                 <p>Email: ${user.email}</p>
//               `
//             }
      

        