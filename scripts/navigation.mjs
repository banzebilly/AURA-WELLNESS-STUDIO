
// menu btn and list items

export const desplayNavationMenu = () => {
  const  menuBth = document.querySelector("#menu");
   const navLinks =  document.querySelector(".navigation");

   if (menuBth && navLinks) {
     menuBth.addEventListener("click", () =>{

        menuBth.classList.toggle("open");
        navLinks.classList.toggle("open");

     });
     

   }
}



export const displayDate = () =>{
    const year = document.querySelector("#year");
    const lastModified = document.querySelector("#lastModified");
    
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    if(lastModified) {
        lastModified.textContent = document.lastModified;
    }
}

