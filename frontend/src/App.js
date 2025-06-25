import Content from './components/Content';
import Header from './components/Header';
import './App.css';

import Footer from './components/Footer';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUsers, toUpdate } from './usersSlice';
import { loadUsers } from './features/utils';


function App() {

  const dispatch = useDispatch()


  useEffect(() => {
    
    const init = async () => { 
      dispatch(toUpdate(await loadUsers(3)))

     }
    init()
  }, []
  )



  return (


    <div className="App">
      <Header />
      <Content />


      <Footer />


    </div>
  );
}

export default App;
