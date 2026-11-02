
// ==========================================
// AURA WELLNESS STUDIO
// Appointment Form - EmailJS Integration
// ==========================================

// 1. Initialize EmailJS
emailjs.init({
    publicKey: "Fu9_RFAW1VUhFtqUv"
});

// 2. Select HTML elements
const appointmentForm = document.querySelector("#appointmentForm");
const submitButton = document.querySelector("#submit");
const formMessage = document.querySelector("#form-message");
const dateInput = document.querySelector("#date");

// 3. Prevent clients from selecting past dates
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

dateInput.min = `${year}-${month}-${day}`;

// 4. Listen for form submission
appointmentForm.addEventListener("submit", async (event) => {

    // Stop the default form submission
    event.preventDefault();

    // Prevent multiple submissions
    submitButton.disabled = true;
    submitButton.textContent = "Sending Request...";

    formMessage.textContent = "";
    formMessage.style.color = "";

    try {

        // 5. Send form information to EmailJS
        await emailjs.sendForm(
            "service_aioqhtx",
            "template_rh4y52k",
            appointmentForm
        );

        // 6. Display success message
        formMessage.textContent =
            "Thank you! Your appointment request has been sent. We will contact you shortly.";

        formMessage.style.color = "green";

        // 7. Clear the form
        appointmentForm.reset();

    } catch (error) {

        // 8. Display error message
        console.error("EmailJS Error:", error);

        formMessage.textContent =
            "Sorry, something went wrong. Please try again or contact us on WhatsApp.";

        formMessage.style.color = "red";

    } finally {

        // 9. Restore the button
        submitButton.disabled = false;
        submitButton.textContent = "Make Appointment";

    }

});
