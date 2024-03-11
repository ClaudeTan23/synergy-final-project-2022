import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as BackgroundIndex from './component/index-background.tsx';
import { createBrowserRouter, RouterProvider, Link, Outlet } from "react-router-dom";
import * as Login from "./component/login.tsx";
import * as Register from "./component/register.tsx";
import { Verify } from './component/verify.tsx';
import { Home } from './component/home.tsx';
import * as AdminBackground from './component/admin-index-background.tsx';
import * as AdminRegister from "./component/admin-register.tsx";
import * as AdminLogin from "./component/admin-login.tsx";
import { AdminVerify } from './component/admin-verify.tsx';
import { Dashboard } from './component/dashboard.tsx';
import { PostReport } from './component/report-post.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "*",
    element: <Home.Home />,
    children: [
      {
        path: ":params",
        element: <div>asd</div>,
      },
      // {
      //   path: "dsa",
      //   element: <div>dsa</div>,
      // },
    ],
  },
  {
    path: "/verify",
    element: <Verify.Main />,
  },
  // {
  //   path: "/averify",
  //   element: <AdminVerify.Main />,
  // },
  {
    path: "*",
    element: <BackgroundIndex.Background.Container />,
    children: [
      {
        path: "login",
        element: <Login.LoginInterface.Login />,
      },
      {
        path: "register",
        element: <Register.RegisterInterface.Container />,
      },
    ],
  },
  // {
  //   path: "/admin/*",
  //   element: <AdminBackground.AdminBackground.Container />,
  //   children: [
  //     {
  //       path: "login",
  //       element: <AdminLogin.LoginInterface.Login />,
  //     },
  //     {
  //       path: "register",
  //       element: <AdminRegister.RegisterInterface.Container />,
  //     },
  //   ],
  // },
  // {
  //   path: "/dashboard",
  //   element: <Dashboard />,
  // },
  // {
  //   path: "/report/post/:postId",
  //   element: <PostReport />,
  // },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
