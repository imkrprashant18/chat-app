
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";

// import InformationPage from "./pages/information";

// import Contact from "./pages/contact";
import ChatsPage from "./pages/AllChats";







// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  // {
  //   path: "/my",
  //   element: <InformationPage />,
  // },
  // {
  //   path: "/contact",
  //   element: <Contact />,
  // },
  {
    path: "/chats",
    element: <ChatsPage />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
