import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Encrypt from "./pages/Encrypt";
import Decrypt from "./pages/Decrypt";
import Keys from "./pages/Keys";
import Docs from './pages/Docs';

const App = () => {
  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Encrypt />} />
        <Route path="/decrypt" element={<Decrypt />} />
        <Route path="/keys" element={<Keys />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
