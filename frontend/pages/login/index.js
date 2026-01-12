import {    useEffect, useState } from "react";
import './login.css';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tokenValid, setTokenValid] = useState("");


    
  useEffect(() => {
        const handleOnPageLoad = async () => {
            const payload = {
                "api_key": "public_api_key_12345"
            }
            const AuthorizationGetJwt = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get_jwt_token_by_api_key/?api_key=MY_SUPER_SECRET_KEY`, {
                method: 'GET'
            });

            const data = await AuthorizationGetJwt.json();
            if(AuthorizationGetJwt.status === 200){
                if(typeof data == 'object'){
                    if(data.responseCode == 0){
                        setTokenValid(data.data.access);
                    }else{
                        console.error("Error fetching JWT Token:", data.responseMessage);
                    }
                }
            } else {
                console.error("Failed to fetch JWT Token:", data);
            }
        };

        window.addEventListener("load", handleOnPageLoad);
        handleOnPageLoad();
        return () => {
            window.removeEventListener("load", handleOnPageLoad);
        };

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.responseCode === 0) {
            console.log(" Login successful:", data);
            localStorage.setItem("accessToken", data.data.access);
            localStorage.setItem("refreshToken", data.data.refresh);
            } else {
            console.error(" Login failed:", data.responseMessage);
            }
        } catch (err) {
            console.error(" Error during login request:", err);
        }

    };

    return (
    <div className="login-container">
        <div className="login-left">
            <div className="form-wrapper">
                <div className="logo">
                    <i className="fa-solid fa-code"></i> SoftQA
                </div>
                <h2>Welcome Back!</h2>
                <p className="subtitle">Sign in to access your dashboard and continue optimizing your QA process.</p>

                <form onSubmit={handleSubmit} className="login-form" >
                    <div className="input-group">
                        <label>Email</label>
                        <div className="input-icon">
                            <i className="fa-regular fa-envelope"></i>
                            <input type="email" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your email / username" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-icon">
                            <i className="fa-solid fa-lock"></i>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password ***" />
                            <i className="fa-regular fa-eye-slash show-hide"></i>
                        </div>
                    </div>

                    <div className="input-group">
                        <input type="hidden" value={tokenValid} />
                            
                    </div>

                    <div className="forgot-password">
                        <a href="#">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn-primary">Sign In</button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button type="button" className="btn-social">
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" /> Continue with Google
                    </button>
                    <button type="button" className="btn-social">
                        <i className="fa-brands fa-apple"></i> Continue with Apple
                    </button>

                    <p className="signup-link">Don't have an Account? <a href="#">Sign Up</a></p>
                </form>
            </div>
        </div>

        <div className="login-right">
            <div className="content-wrapper">
                <h1>Bridging the Gap Between Learning and Technology</h1>
                <div className="testimonial">
                    
                    <p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#ffffff" d="M11.192 15.757c0-.88-.23-1.618-.69-2.217c-.326-.412-.768-.683-1.327-.812c-.55-.128-1.07-.137-1.54-.028c-.16-.95.1-1.956.76-3.022c.66-1.065 1.515-1.867 2.558-2.403L9.372 5c-.8.396-1.56.898-2.26 1.505c-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69s-.345 2.04-.216 3.1c.168 1.4.62 2.52 1.356 3.35C5.837 18.58 6.754 19 7.85 19c.965 0 1.766-.29 2.4-.878c.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217c-.326-.42-.77-.692-1.327-.817c-.56-.124-1.073-.13-1.54-.022c-.16-.94.09-1.95.752-3.02c.66-1.06 1.513-1.86 2.556-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505a11.29 11.29 0 0 0-1.894 2.094c-.556.79-.97 1.68-1.24 2.69a8.042 8.042 0 0 0-.217 3.1c.166 1.4.616 2.52 1.35 3.35c.733.834 1.647 1.252 2.743 1.252c.967 0 1.768-.29 2.402-.877c.627-.576.942-1.365.942-2.368v.011z"/></svg>
                        Our communication with parents has never been stronger. This system provides a seamless experience for tracking academic progress and ensures our school community stays connected and informed  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#ffffff" d="m21.95 8.721l-.025-.168l-.026.006A4.5 4.5 0 1 0 17.5 14c.223 0 .437-.034.65-.065c-.069.232-.14.468-.254.68c-.114.308-.292.575-.469.844c-.148.291-.409.488-.601.737c-.201.242-.475.403-.692.604c-.213.21-.492.315-.714.463c-.232.133-.434.28-.65.35l-.539.222l-.474.197l.484 1.939l.597-.144c.191-.048.424-.104.689-.171c.271-.05.56-.187.882-.312c.317-.143.686-.238 1.028-.467c.344-.218.741-.4 1.091-.692c.339-.301.748-.562 1.05-.944c.33-.358.656-.734.909-1.162c.293-.408.492-.856.702-1.299c.19-.443.343-.896.468-1.336c.237-.882.343-1.72.384-2.437c.034-.718.014-1.315-.028-1.747a7.028 7.028 0 0 0-.063-.539zm-11 0l-.025-.168l-.026.006A4.5 4.5 0 1 0 6.5 14c.223 0 .437-.034.65-.065c-.069.232-.14.468-.254.68c-.114.308-.292.575-.469.844c-.148.291-.409.488-.601.737c-.201.242-.475.403-.692.604c-.213.21-.492.315-.714.463c-.232.133-.434.28-.65.35l-.539.222c-.301.123-.473.195-.473.195l.484 1.939l.597-.144c.191-.048.424-.104.689-.171c.271-.05.56-.187.882-.312c.317-.143.686-.238 1.028-.467c.344-.218.741-.4 1.091-.692c.339-.301.748-.562 1.05-.944c.33-.358.656-.734.909-1.162c.293-.408.492-.856.702-1.299c.19-.443.343-.896.468-1.336c.237-.882.343-1.72.384-2.437c.034-.718.014-1.315-.028-1.747a7.571 7.571 0 0 0-.064-.537z"/></svg>
                    </p>
                    
                    <div className="user-info">
                        <img src="https://i.pravatar.cc/50?u=marcus" alt="Dr. Marcus Thorne" />
                        <div>
                            <strong>Dr. Marcus Thorne</strong><br/>
                            <span>Dean of Students, Northpoint Prep</span>
                        </div>
                    </div>
                </div>

                <div className="footer-logos">
                    <p>JOIN 1K TEAMS</p>
                    <div className="logo-grid">
                        <span>Discord</span>
                        <span>mailchimp</span>
                        <span>grammarly</span>
                        <span>attentive</span>
                        <span>HELLOSIGN</span>
                        <span>INTERCOM</span>
                        <span>Square</span>
                        <span>Dropbox</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
