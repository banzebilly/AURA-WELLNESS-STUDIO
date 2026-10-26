const form = document.querySelector("#appointmentForm");

if (form) {

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const appointment = {
            firstName: document.querySelector("#firstName").value,
            email: document.querySelector("#email").value,
            phone: document.querySelector("#phone").value,
            service: document.querySelector("#service").value,
            date: document.querySelector("#date").value,
            time: document.querySelector("#time").value,
            notes: document.querySelector("#notes").value
        };

        localStorage.setItem("appointment", JSON.stringify(appointment));

        window.location.href = "thanks.html";
    });

}