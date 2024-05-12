import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Layout from "./Components/Layout/Layout.tsx";
import Home from "./Components/Home/Home.tsx";
import './App.css'
import CreateListing from './Components/CreateListing/CreateListing.tsx';


function App() {

  const router: any = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route>
        <Route path="/create-listing" element={<CreateListing />} />
      </Route>
    </Route>
  ));

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
