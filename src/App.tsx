import "./App.css";
import Spinner from "./components/Spinner";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import GetDegrees from "./pages/getDegrees";
import Home from "./pages/home";
import Edit from "./pages/edit";
import Finalize from "./pages/finalize";
import { CookiesProvider } from "react-cookie";
import View from "./pages/view";
import About from "./pages/about";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/getDegrees",
    element: <GetDegrees />,
  },
  {
    path: "/edit/:id",
    element: <Edit />,
  },
  {
    path: "/tt/:id",
    element: <View />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/finalize/:id",
    element: <Finalize />,
  },
]);
function App() {
  return (
    <>
      <CookiesProvider>
        <RouterProvider
          router={router}
          fallbackElement={
            <div className="flex bg-slate-950 h-screen w-full justify-center items-center">
              <Spinner />
            </div>
          }
        />
      </CookiesProvider>
    </>
  );
}

export default App;
