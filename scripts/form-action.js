// // Banze Billy

// // get form the form data 

const params = new URLSearchParams(window.location.search);

const firstName = params.get("firstName");
const email = params.get("email");
const phone = params.get("phone");
// const services = params.get("services");
const date = params.get("date");
const time = params.get("time");
const notes = params.get("notes");

document.querySelector("#firstName").textContent = firstName || "Not provided";
document.querySelector("#email").textContent = email || "Not provided";
document.querySelector("#phone").textContent = phone || "Not provided";
// document.querySelector(".service").textContent = service ;
document.querySelector("#service").textContent =  params.get("service") || "Not provided";
document.querySelector("#date").textContent = date || "Not provided";
document.querySelector("#time").textContent = time || "Not provided";
document.querySelector("#notes").textContent = notes ;





























































































//  const details = document.querySelector("#appointmentDetails");


// if (details) {

//    const appointment = JSON.parse(localStorage.getItem("appointment"));

//     if (appointment) {

//        details.innerHTML = `
//             <h2 class="note">Your Appointment</h2>             <p><strong>Name:</strong> ${appointment.firstName}</p>
//             <p><strong>Email:</strong> ${appointment.email}</p>
//              <p><strong>Phone:</strong> ${appointment.phone}</p>
//             <p><strong>Service:</strong> ${appointment.service}</p>
//              <p><strong>Date:</strong> ${appointment.date}</p>
//             <p><strong>Time:</strong> ${appointment.time}</p>
//              <p><strong>Notes:</strong> ${appointment.notes || "None"}</p>
//             <a href="index.html" class="btn">Return Home</a>
//              <a href="contact.html" class="btn">Book Another Appointment</a>
//         `;

//     }

//  }