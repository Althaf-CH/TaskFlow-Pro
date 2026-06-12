const API_URL =
"https://taskflow-pro-production-b789.up.railway.app";

const registerForm =
document.getElementById("registerForm");

if(registerForm){

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const name =
            document.getElementById("name").value;

            const email =
            document.getElementById("email").value;

            const password =
            document.getElementById("password").value;

            const response =
            await fetch(
                `${API_URL}/register`,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data =
            await response.json();

            alert(data.message);

            if(response.ok){

                window.location =
                "login.html";

            }

        }
    );

}

const loginForm =
document.getElementById("loginForm");

if(loginForm){

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
            document.getElementById("loginEmail").value;

            const password =
            document.getElementById("loginPassword").value;

            const response =
            await fetch(
                `${API_URL}/login`,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data =
            await response.json();

            if(response.ok){

                localStorage.setItem(
                    "userId",
                    data.userId
                );

                localStorage.setItem(
                    "name",
                    data.name
                );

                window.location =
                "dashboard.html";

            }
            else{

                alert(data.message);

            }

        }
    );

}