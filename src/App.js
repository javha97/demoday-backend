import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import axios from 'axios'
function App() {
  let arr=[]
  const [l, setl] = useState([])
  const [g,setg]=useState([])
  const fn = async () => {
    const data = await axios.patch(`http://localhost:8080/yMP6PBf5H1XIilJXVYzw`, {
      body: {
        "images": JSON.stringify(myarr),
      }
    })
    console.log(data.data);
  }
  const img = (e) => {
    const m = e.target.files
    Array.from(m).map((el,i)=>{
      var file = e.target.files[i];
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setg((g)=> [...g,reader.result])
      }      
    })
  }
  let myarr=[]
  g.map((el)=>{
    const fixedbase64 = el.split(/,(.+)/)[1]
      myarr.push({img: fixedbase64, imgName: `cffb47ef1b98be29cdf3f7a88ee56849`})
  })
  console.log(myarr);
  return (
    <>
      <input type="file" multiple onChange={(e) => img(e)} />
      <button onClick={fn}></button>
    </>
  );
}

export default App;
