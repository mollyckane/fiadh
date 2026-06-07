const registerForm = document.querySelector('.register-form');
const loginForm = document.querySelector('.login-form');

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}


// REGISTRATION: register form validation + submission
async function handleRegister(e) {
    e.preventDefault(); //stop page reloading

    //get form values
    const data = {
        fname: document.getElementById('fname').value.trim(),
        lname: document.getElementById('lname').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value.trim()
    };

    //validation check
    if (!data.fname || !data.lname || !data.email || !data.password) {
        alert('Please fill in all fields.');
        return;
    }

    try{
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token); //save token to localStorage for future authenticated requests
            window.location.href = '/dashboard.html'; //redirect to dashboard after successful registration
        } else {
            alert(result.error || result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

// LOGIN: login form validation + submission
async function handleLogin(e) {
    e.preventDefault(); //stop page reloading

    //get form values
    const data = {
        email: document.getElementById('login-email').value.trim(),
        password: document.getElementById('password').value.trim()
    };

    //validation check
    if (!data.email || !data.password) {
        alert('Please fill in all fields.');
        return;
    }

    try{
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token); //save token to localStorage for future authenticated requests
            window.location.href = '/dashboard.html'; //redirect to dashboard after successful login
        } else {
            alert(result.error || result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}