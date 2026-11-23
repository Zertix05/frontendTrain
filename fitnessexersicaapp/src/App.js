import {Route, Routes} from 'react-router-dom'
import {Box} from '@mui/material'
import './App.css';
import ExerciseDetails from './pages/ExerciseDetails';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Box width="400px" sx={{width:{xl:'1488px'}}} m="auto">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/exersice/:id" element={<ExerciseDetails/>}/>
        <Route path="/" element={<Home/>}/>
        <Route path="/" element={<Home/>}/>
      </Routes>
      <Footer/>
    </Box>
  );
}

export default App;
