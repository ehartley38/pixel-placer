import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";
import axiosInstance from "./services/axios";

function App() {
  const [count, setCount] = useState(0);

  const testRequest = async () => {
    try {
      const test = await axiosInstance.get("/test");

      setCount(test.data.msg)
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1>Hello</h1>
      <div className="card">
        <button onClick={testRequest}>count is {count}</button>
      </div>
    </>
  );
}

export default App;
