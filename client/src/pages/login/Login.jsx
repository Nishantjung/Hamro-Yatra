import "./login.scss";
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const [err, setErr] = useState(null);

  const { login, currentUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
    } catch (err) {
      toast.error(err.response.data);
      return;
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  return (
    <div className="login">
      <div className="login-card">
        <div className="left">
          <h1>Welcome back</h1>
          <span>Welcome back! Please enter your details.</span>
          <form>
            <label htmlFor="email">Email</label>

            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
            />
            <div className="options-wrapper">
              <div className="option-remember">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Remember me</label>
              </div>
            </div>
            {err && err}
            <button onClick={handleClick}>Login</button>
          </form>
        </div>
        <div className="right">
          <h1>Hamro Yatra</h1>
          <p>
            Find your perfect travel companion and explore the world with Hamro
            Yatra. From planning and booking to sharing unforgettable
            experiences, connect with like-minded travelers and create memories
            that last a lifetime. With Hamro Yatra, the journey is just as
            important as the destination
          </p>
          <span>Don't have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
